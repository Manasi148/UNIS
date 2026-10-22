package com.unis.announcement;

import com.unis.audit.AuditService;
import com.unis.common.ForbiddenException;
import com.unis.common.PagedResponse;
import com.unis.common.ResourceNotFoundException;
import com.unis.department.Department;
import com.unis.department.DepartmentRepository;
import com.unis.notification.NotificationService;
import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final AnnouncementBookmarkRepository bookmarkRepository;
    private final AnnouncementReadRepository readRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final AuditService auditService;

    public AnnouncementService(AnnouncementRepository announcementRepository,
                               AnnouncementBookmarkRepository bookmarkRepository,
                               AnnouncementReadRepository readRepository,
                               DepartmentRepository departmentRepository,
                               UserRepository userRepository,
                               NotificationService notificationService,
                               AuditService auditService) {
        this.announcementRepository = announcementRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.readRepository = readRepository;
        this.departmentRepository = departmentRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    @Transactional
    public AnnouncementDto createAnnouncement(CreateAnnouncementRequest request, User author) {
        if (author.getRole() == Role.STUDENT) {
            throw new ForbiddenException("Students are not authorized to publish institutional campus announcements");
        }

        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId()).orElse(null);
        }

        Announcement a = new Announcement();
        a.setTitle(request.getTitle().trim());
        a.setBody(request.getBody().trim());
        a.setCategory(request.getCategory().trim());
        a.setAuthor(author);
        a.setTargetRole(request.getTargetRole() != null ? request.getTargetRole().trim().toUpperCase() : "ALL");
        a.setDepartment(dept);
        a.setPinned(request.isPinned());
        a.setPublished(request.isPublished());
        a.setPublishAt(Instant.now());
        a.setExpiresAt(request.getExpiresAt());

        Announcement saved = announcementRepository.save(a);

        auditService.log(author, "PUBLISH_ANNOUNCEMENT", "ANNOUNCEMENT", saved.getId(),
                "Published notice: " + saved.getTitle() + " for audience: " + saved.getTargetRole(), null);

        return AnnouncementDto.fromEntity(saved, false, true);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AnnouncementDto> getAnnouncementsForUser(User currentUser, String category, String search, Pageable pageable) {
        List<String> targetRoles = new ArrayList<>();
        targetRoles.add("ALL");

        if (currentUser.getRole() == Role.STUDENT) {
            targetRoles.add("STUDENT");
        } else if (currentUser.getRole() == Role.DEPARTMENT_HEAD) {
            targetRoles.add("DEPARTMENT_HEAD");
        } else if (currentUser.getRole() == Role.ADMIN) {
            // Admin sees all
            Page<Announcement> page = announcementRepository.findAllForAdmin(category, search, pageable);
            return PagedResponse.of(page.map(a -> mapDto(a, currentUser.getId())));
        }

        Page<Announcement> page = announcementRepository.findTargetedAnnouncements(targetRoles, category, search, pageable);
        return PagedResponse.of(page.map(a -> mapDto(a, currentUser.getId())));
    }

    @Transactional
    public AnnouncementDto getAnnouncementById(Long id, User currentUser) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        // Record read status
        if (!readRepository.existsByAnnouncementIdAndUserId(id, currentUser.getId())) {
            AnnouncementRead read = new AnnouncementRead(a, currentUser);
            readRepository.save(read);
        }

        return mapDto(a, currentUser.getId());
    }

    @Transactional
    public void bookmarkAnnouncement(Long id, User currentUser) {
        Announcement a = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement not found"));

        if (!bookmarkRepository.existsByAnnouncementIdAndUserId(id, currentUser.getId())) {
            AnnouncementBookmark bm = new AnnouncementBookmark(a, currentUser);
            bookmarkRepository.save(bm);
        }
    }

    @Transactional
    public void unbookmarkAnnouncement(Long id, User currentUser) {
        bookmarkRepository.deleteByAnnouncementIdAndUserId(id, currentUser.getId());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getBookmarkedAnnouncements(User currentUser) {
        List<Announcement> list = bookmarkRepository.findBookmarkedAnnouncementsByUser(currentUser.getId());
        return list.stream().map(a -> mapDto(a, currentUser.getId())).collect(Collectors.toList());
    }

    private AnnouncementDto mapDto(Announcement a, Long userId) {
        boolean bookmarked = bookmarkRepository.existsByAnnouncementIdAndUserId(a.getId(), userId);
        boolean read = readRepository.existsByAnnouncementIdAndUserId(a.getId(), userId);
        return AnnouncementDto.fromEntity(a, bookmarked, read);
    }
}
