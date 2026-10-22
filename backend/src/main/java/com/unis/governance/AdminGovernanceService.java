package com.unis.governance;

import com.unis.audit.AuditService;
import com.unis.common.BadRequestException;
import com.unis.common.ForbiddenException;
import com.unis.common.ResourceNotFoundException;
import com.unis.notification.NotificationService;
import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserDto;
import com.unis.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminGovernanceService {

    private final UserRepository userRepository;
    private final AdminRemovalProposalRepository proposalRepository;
    private final AdminRemovalApprovalRepository approvalRepository;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public AdminGovernanceService(UserRepository userRepository,
                                  AdminRemovalProposalRepository proposalRepository,
                                  AdminRemovalApprovalRepository approvalRepository,
                                  AuditService auditService,
                                  NotificationService notificationService) {
        this.userRepository = userRepository;
        this.proposalRepository = proposalRepository;
        this.approvalRepository = approvalRepository;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getGovernanceOverview(User actor) {
        verifyAdmin(actor);

        List<User> admins = userRepository.findByRole(Role.ADMIN);
        long activeCount = admins.stream().filter(User::isActive).count();
        boolean canProposeRemoval = (activeCount == 5);

        List<AdminRemovalProposal> activeProposals = proposalRepository.findByStatusOrderByCreatedAtDesc("PENDING");
        List<AdminRemovalProposalDto> activeProposalDtos = activeProposals.stream()
                .map(p -> AdminRemovalProposalDto.fromEntity(p, actor.getId()))
                .collect(Collectors.toList());

        List<UserDto> adminDtos = admins.stream()
                .map(UserDto::fromEntity)
                .collect(Collectors.toList());

        Map<String, Object> result = new HashMap<>();
        result.put("administrators", adminDtos);
        result.put("activeCount", activeCount);
        result.put("maxAllowed", 5);
        result.put("canProposeRemoval", canProposeRemoval);
        result.put("ruleExplanation", canProposeRemoval
                ? "Exactly 5 active administrators exist. Removal proposals can be initiated and require unanimous approval (4 of 4) by all non-target administrators."
                : "Removal proposals are restricted: Exactly 5 active administrators are required to initiate removal governance (currently " + activeCount + " active). Other administrators cannot remove one another.");
        result.put("pendingProposals", activeProposalDtos);

        return result;
    }

    @Transactional(readOnly = true)
    public List<AdminRemovalProposalDto> getAllProposals(User actor) {
        verifyAdmin(actor);
        return proposalRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(p -> AdminRemovalProposalDto.fromEntity(p, actor.getId()))
                .collect(Collectors.toList());
    }

    @Transactional
    public AdminRemovalProposalDto proposeRemoval(ProposeRemovalRequest request, User proposerActor) {
        verifyAdmin(proposerActor);

        long activeCount = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
        if (activeCount != 5) {
            throw new BadRequestException("Removal proposals require exactly 5 active administrators. Current active count is " +
                    activeCount + ". When fewer than 5 administrators exist, no administrator may remove another administrator.");
        }

        User target = userRepository.findById(request.getTargetAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Target administrator not found with ID: " + request.getTargetAdminId()));

        if (target.getRole() != Role.ADMIN || !target.isActive()) {
            throw new BadRequestException("Target account must be an active administrator.");
        }

        if (target.getId().equals(proposerActor.getId())) {
            throw new BadRequestException("You cannot propose your own removal. For voluntary departure, use the founder self-revocation workflow.");
        }

        if (target.isFounder()) {
            throw new BadRequestException("Founder protection rule: The founder administrator cannot be removed by other administrators through proposal workflows.");
        }

        if (proposalRepository.existsByTargetAdminIdAndStatus(target.getId(), "PENDING")) {
            throw new BadRequestException("A pending removal proposal already exists for administrator " + target.getEmail());
        }

        AdminRemovalProposal proposal = new AdminRemovalProposal();
        proposal.setTargetAdmin(target);
        proposal.setProposerAdmin(proposerActor);
        proposal.setReason(request.getReason().trim());
        proposal.setStatus("PENDING");
        proposal.setRequiredApprovals(4);

        // Proposer counts as the 1st of 4 required approvals
        AdminRemovalApproval firstApproval = new AdminRemovalApproval(proposal, proposerActor);
        proposal.getApprovals().add(firstApproval);

        AdminRemovalProposal saved = proposalRepository.save(proposal);

        auditService.log(proposerActor, "PROPOSE_ADMIN_REMOVAL", "USER", target.getId(),
                "Proposed removal of administrator " + target.getEmail() + " (1/4 initial approval recorded). Reason: " + request.getReason(), null);

        // Notify other administrators
        for (User admin : userRepository.findByRoleAndActiveTrue(Role.ADMIN)) {
            if (!admin.getId().equals(proposerActor.getId())) {
                notificationService.createNotification(admin, "ADMIN_REMOVAL_PROPOSED",
                        "Administrator Removal Proposal Initiated",
                        proposerActor.getFullName() + " initiated a removal proposal for " + target.getFullName() +
                                ". Unanimous non-target approval (4 of 4) is required.",
                        "PROPOSAL", saved.getId());
            }
        }

        return AdminRemovalProposalDto.fromEntity(saved, proposerActor.getId());
    }

    @Transactional
    public AdminRemovalProposalDto approveRemoval(Long proposalId, User approvingActor) {
        verifyAdmin(approvingActor);

        AdminRemovalProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Removal proposal not found with ID: " + proposalId));

        if (!"PENDING".equalsIgnoreCase(proposal.getStatus())) {
            throw new BadRequestException("This removal proposal is not pending (status: " + proposal.getStatus() + ")");
        }

        if (proposal.getTargetAdmin().getId().equals(approvingActor.getId())) {
            throw new BadRequestException("The target administrator cannot approve their own removal proposal.");
        }

        if (approvalRepository.existsByProposalIdAndAdminId(proposal.getId(), approvingActor.getId())) {
            throw new BadRequestException("You have already recorded your approval for this removal proposal.");
        }

        long activeCount = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
        if (activeCount != 5) {
            throw new BadRequestException("Removal governance requires exactly 5 active administrators. Current count: " + activeCount);
        }

        AdminRemovalApproval approval = new AdminRemovalApproval(proposal, approvingActor);
        approvalRepository.save(approval);
        proposal.getApprovals().add(approval);

        int currentApprovals = proposal.getApprovals().size();

        if (currentApprovals >= proposal.getRequiredApprovals()) {
            // Unanimous (4 of 4) approval reached! Execute removal.
            User target = proposal.getTargetAdmin();
            if (target.isFounder()) {
                throw new BadRequestException("Founder administrator cannot be removed.");
            }

            target.setActive(false);
            userRepository.save(target);

            proposal.setStatus("EXECUTED");
            proposal.setExecutedAt(Instant.now());
            proposalRepository.save(proposal);

            auditService.log(approvingActor, "EXECUTE_ADMIN_REMOVAL", "USER", target.getId(),
                    "Unanimous approval reached (4/4). Revoked administrator access for " + target.getEmail(), null);

            for (User admin : userRepository.findByRoleAndActiveTrue(Role.ADMIN)) {
                notificationService.createNotification(admin, "ADMIN_REMOVED",
                        "Administrator Removal Finalized",
                        "Removal proposal for " + target.getFullName() + " received 4 of 4 approvals and has been executed.",
                        "USER", target.getId());
            }
        } else {
            proposalRepository.save(proposal);
            auditService.log(approvingActor, "APPROVE_ADMIN_REMOVAL", "PROPOSAL", proposal.getId(),
                    "Recorded approval for removal of " + proposal.getTargetAdmin().getEmail() + " (" + currentApprovals + "/4 approvals)", null);
        }

        return AdminRemovalProposalDto.fromEntity(proposal, approvingActor.getId());
    }

    @Transactional
    public AdminRemovalProposalDto cancelProposal(Long proposalId, User cancellingActor) {
        verifyAdmin(cancellingActor);

        AdminRemovalProposal proposal = proposalRepository.findById(proposalId)
                .orElseThrow(() -> new ResourceNotFoundException("Removal proposal not found with ID: " + proposalId));

        if (!"PENDING".equalsIgnoreCase(proposal.getStatus())) {
            throw new BadRequestException("Only pending proposals can be cancelled.");
        }

        if (!proposal.getProposerAdmin().getId().equals(cancellingActor.getId()) && !cancellingActor.isFounder()) {
            throw new ForbiddenException("Only the proposing administrator or the founder can cancel this proposal.");
        }

        proposal.setStatus("CANCELLED");
        proposalRepository.save(proposal);

        auditService.log(cancellingActor, "CANCEL_ADMIN_PROPOSAL", "PROPOSAL", proposal.getId(),
                "Cancelled administrator removal proposal for " + proposal.getTargetAdmin().getEmail(), null);

        return AdminRemovalProposalDto.fromEntity(proposal, cancellingActor.getId());
    }

    @Transactional
    public void founderSelfRevocation(FounderSelfRevocationRequest request, User founderActor) {
        verifyAdmin(founderActor);

        if (!founderActor.isFounder()) {
            throw new ForbiddenException("Only the designated founder administrator can initiate voluntary self-revocation.");
        }

        long activeCount = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
        if (activeCount < 2) {
            throw new BadRequestException("Founder self-revocation cannot leave the system without a viable active administrator. At least 2 active administrators must exist before stepping down.");
        }

        User successor = userRepository.findById(request.getSuccessorAdminId())
                .orElseThrow(() -> new ResourceNotFoundException("Successor administrator not found with ID: " + request.getSuccessorAdminId()));

        if (successor.getRole() != Role.ADMIN || !successor.isActive()) {
            throw new BadRequestException("Designated successor must be an active administrator.");
        }

        if (successor.getId().equals(founderActor.getId())) {
            throw new BadRequestException("Successor must be a distinct administrator.");
        }

        // Succession transition
        successor.setFounder(true);
        userRepository.save(successor);

        founderActor.setFounder(false);
        founderActor.setActive(false);
        userRepository.save(founderActor);

        auditService.log(founderActor, "FOUNDER_SELF_REVOCATION", "USER", founderActor.getId(),
                "Founder stepped down voluntarily and transferred primary administrator designation to " + successor.getEmail() +
                        (request.getNotes() != null ? ". Notes: " + request.getNotes() : ""), null);

        for (User admin : userRepository.findByRoleAndActiveTrue(Role.ADMIN)) {
            notificationService.createNotification(admin, "FOUNDER_SUCCESSION",
                    "Founder Succession Completed",
                    founderActor.getFullName() + " stepped down and transferred founder designation to " + successor.getFullName(),
                    "USER", successor.getId());
        }
    }

    private void verifyAdmin(User user) {
        if (user == null || user.getRole() != Role.ADMIN || !user.isActive()) {
            throw new ForbiddenException("Access restricted to active institutional administrators.");
        }
    }
}
