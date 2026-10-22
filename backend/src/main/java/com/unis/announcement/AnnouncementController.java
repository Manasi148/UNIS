package com.unis.announcement;

import com.unis.common.ApiResponse;
import com.unis.common.PagedResponse;
import com.unis.security.CustomUserDetails;
import com.unis.user.User;
import com.unis.user.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final UserService userService;

    public AnnouncementController(AnnouncementService announcementService, UserService userService) {
        this.announcementService = announcementService;
        this.userService = userService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<AnnouncementDto>> createAnnouncement(
            @Valid @RequestBody CreateAnnouncementRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User author = userService.getUserEntity(authUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Announcement published successfully",
                        announcementService.createAnnouncement(request, author)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<AnnouncementDto>>> getAnnouncements(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal CustomUserDetails authUser,
            @PageableDefault(size = 15, sort = "publishAt", direction = Sort.Direction.DESC) Pageable pageable) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success(
                announcementService.getAnnouncementsForUser(user, category, search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AnnouncementDto>> getAnnouncementById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success(announcementService.getAnnouncementById(id, user)));
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> bookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        announcementService.bookmarkAnnouncement(id, user);
        return ResponseEntity.ok(ApiResponse.success("Announcement bookmarked", null));
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> unbookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        announcementService.unbookmarkAnnouncement(id, user);
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed", null));
    }

    @GetMapping("/bookmarked")
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getBookmarked(
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success(announcementService.getBookmarkedAnnouncements(user)));
    }
}
