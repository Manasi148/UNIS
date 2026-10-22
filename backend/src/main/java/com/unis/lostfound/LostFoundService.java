package com.unis.lostfound;

import com.unis.audit.AuditService;
import com.unis.common.BadRequestException;
import com.unis.common.ForbiddenException;
import com.unis.common.PagedResponse;
import com.unis.common.ResourceNotFoundException;
import com.unis.location.CampusLocation;
import com.unis.location.CampusLocationRepository;
import com.unis.notification.NotificationService;
import com.unis.user.Role;
import com.unis.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LostFoundService {

    private final LostFoundItemRepository itemRepository;
    private final ItemClaimRepository claimRepository;
    private final CampusLocationRepository locationRepository;
    private final LostFoundMatchingService matchingService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public LostFoundService(LostFoundItemRepository itemRepository,
                            ItemClaimRepository claimRepository,
                            CampusLocationRepository locationRepository,
                            LostFoundMatchingService matchingService,
                            NotificationService notificationService,
                            AuditService auditService) {
        this.itemRepository = itemRepository;
        this.claimRepository = claimRepository;
        this.locationRepository = locationRepository;
        this.matchingService = matchingService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public LostFoundDto createItem(CreateLostFoundRequest request, User reporter) {
        CampusLocation location = null;
        if (request.getLocationId() != null) {
            location = locationRepository.findById(request.getLocationId()).orElse(null);
        }

        LostFoundItem item = new LostFoundItem();
        item.setTitle(request.getTitle().trim());
        item.setDescription(request.getDescription().trim());
        item.setCategory(request.getCategory().trim());
        item.setColor(request.getColor() != null ? request.getColor().trim() : null);
        item.setItemType(request.getItemType().trim().toUpperCase());
        item.setStatus("OPEN");
        item.setLocation(location);
        item.setLocationDescription(request.getLocationDescription());
        item.setDateOccurred(request.getDateOccurred());
        item.setImageUrl(request.getImageUrl());
        item.setReportedBy(reporter);
        item.setContactInfo(request.getContactInfo());

        LostFoundItem saved = itemRepository.save(item);

        auditService.log(reporter, "CREATE_LOST_FOUND_ITEM", "LOST_FOUND", saved.getId(),
                "Reported " + saved.getItemType() + " item: " + saved.getTitle(), null);

        // Check for intelligent match suggestions right away
        List<LostFoundMatchingService.MatchCandidate> matches = matchingService.findPossibleMatches(saved.getId());
        if (!matches.isEmpty()) {
            LostFoundMatchingService.MatchCandidate topMatch = matches.get(0);
            notificationService.createNotification(
                    reporter,
                    "ITEM_MATCH_SUGGESTION",
                    "Possible Match Identified (" + topMatch.getMatchScore() + "%)",
                    topMatch.getExplanation(),
                    "LOST_FOUND",
                    topMatch.getCandidateId()
            );
        }

        return LostFoundDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<LostFoundDto> getItems(String itemType, String category, String status,
                                                Long reportedById, String search, Pageable pageable) {
        Page<LostFoundItem> page = itemRepository.filterItems(itemType, category, status, reportedById, search, pageable);
        return PagedResponse.of(page.map(item -> {
            LostFoundDto dto = LostFoundDto.fromEntity(item);
            dto.setClaimsCount(claimRepository.countByItemId(item.getId()));
            return dto;
        }));
    }

    @Transactional(readOnly = true)
    public LostFoundDto getItemById(Long id) {
        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));
        LostFoundDto dto = LostFoundDto.fromEntity(item);
        dto.setClaimsCount(claimRepository.countByItemId(item.getId()));
        return dto;
    }

    @Transactional
    public LostFoundDto updateItemStatus(Long id, String status, User actor) {
        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (actor.getRole() == Role.STUDENT && !item.getReportedBy().getId().equals(actor.getId())) {
            throw new ForbiddenException("Not authorized to update status for this listing");
        }

        String validStatus = status != null ? status.trim().toUpperCase() : "OPEN";
        item.setStatus(validStatus);
        LostFoundItem saved = itemRepository.save(item);

        auditService.log(actor, "UPDATE_LOST_FOUND_STATUS", "LOST_FOUND", saved.getId(),
                "Updated status to " + validStatus + " for item: " + saved.getTitle(), null);

        LostFoundDto dto = LostFoundDto.fromEntity(saved);
        dto.setClaimsCount(claimRepository.countByItemId(saved.getId()));
        return dto;
    }

    @Transactional
    public void deleteItem(Long id, User actor) {
        LostFoundItem item = itemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id));

        if (actor.getRole() == Role.STUDENT && !item.getReportedBy().getId().equals(actor.getId())) {
            throw new ForbiddenException("Not authorized to remove this listing");
        }

        auditService.log(actor, "DELETE_LOST_FOUND_ITEM", "LOST_FOUND", item.getId(),
                "Deleted listing: " + item.getTitle(), null);

        List<ItemClaim> claims = claimRepository.findByItemId(id);
        claimRepository.deleteAll(claims);
        itemRepository.delete(item);
    }

    @Transactional
    public ItemClaimDto submitClaim(Long itemId, CreateClaimRequest request, User claimant) {
        LostFoundItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with ID: " + id(itemId)));

        // Cannot claim own item
        if (item.getReportedBy().getId().equals(claimant.getId())) {
            throw new BadRequestException("You cannot submit a claim on an item reported by yourself");
        }

        // Cannot submit duplicate pending claim
        if (claimRepository.existsByItemIdAndClaimantId(itemId, claimant.getId())) {
            throw new BadRequestException("You have already submitted an active claim for this item");
        }

        ItemClaim claim = new ItemClaim(item, claimant, request.getProofDetails().trim());
        ItemClaim saved = claimRepository.save(claim);

        // Notify reporter and claimant
        notificationService.createNotification(
                claimant,
                "CLAIM_SUBMITTED",
                "Claim Submitted for " + item.getTitle(),
                "Your ownership claim has been submitted for institutional review.",
                "LOST_FOUND",
                item.getId()
        );

        notificationService.createNotification(
                item.getReportedBy(),
                "CLAIM_SUBMITTED",
                "New Claim Submitted",
                "A student has submitted an ownership claim for '" + item.getTitle() + "'.",
                "LOST_FOUND",
                item.getId()
        );

        auditService.log(claimant, "SUBMIT_ITEM_CLAIM", "CLAIM", saved.getId(),
                "Submitted claim for item " + item.getTitle(), null);

        return ItemClaimDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<ItemClaimDto> getClaimsForItem(Long itemId, User currentUser) {
        LostFoundItem item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found"));

        boolean isReviewer = currentUser.getRole() != Role.STUDENT;
        boolean isReporter = item.getReportedBy().getId().equals(currentUser.getId());

        List<ItemClaim> claims = claimRepository.findByItemId(itemId);

        // Strict Privacy: Ordinary students can only see their OWN claim details
        return claims.stream()
                .filter(c -> isReviewer || isReporter || c.getClaimant().getId().equals(currentUser.getId()))
                .map(ItemClaimDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ItemClaimDto> getMyClaims(User currentUser) {
        return claimRepository.findByClaimantId(currentUser.getId()).stream()
                .map(ItemClaimDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PagedResponse<ItemClaimDto> getAllClaimsForReview(String status, Pageable pageable) {
        Page<ItemClaim> page = claimRepository.findAllClaims(status, pageable);
        return PagedResponse.of(page.map(ItemClaimDto::fromEntity));
    }

    @Transactional
    public ItemClaimDto reviewClaim(Long claimId, ReviewClaimRequest request, User reviewer) {
        if (reviewer.getRole() == Role.STUDENT) {
            throw new ForbiddenException("Students are not authorized to moderate or review claims");
        }

        ItemClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        // User cannot review or approve their OWN claim
        if (claim.getClaimant().getId().equals(reviewer.getId())) {
            throw new ForbiddenException("You cannot approve or review your own claim");
        }

        String newStatus = request.getClaimStatus().trim().toUpperCase();
        claim.setClaimStatus(newStatus);
        claim.setReviewer(reviewer);
        claim.setReviewNotes(request.getReviewNotes());
        claim.setReviewedAt(Instant.now());

        if ("APPROVED".equalsIgnoreCase(newStatus)) {
            // Mark item as claimed
            LostFoundItem item = claim.getItem();
            item.setStatus("CLAIMED");
            itemRepository.save(item);
        }

        ItemClaim saved = claimRepository.save(claim);

        // Notify claimant of decision
        notificationService.createNotification(
                claim.getClaimant(),
                "CLAIM_REVIEWED",
                "Claim Decision: " + newStatus,
                "Your claim for '" + claim.getItem().getTitle() + "' was reviewed: " + newStatus +
                        (request.getReviewNotes() != null ? " (" + request.getReviewNotes() + ")" : ""),
                "LOST_FOUND",
                claim.getItem().getId()
        );

        auditService.log(reviewer, "REVIEW_CLAIM", "CLAIM", saved.getId(),
                "Claim decision " + newStatus + " for claimant " + claim.getClaimant().getEmail(), null);

        return ItemClaimDto.fromEntity(saved);
    }

    private Long id(Long val) {
        return val != null ? val : 0L;
    }
}
