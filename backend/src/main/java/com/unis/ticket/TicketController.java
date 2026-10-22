package com.unis.ticket;

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
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;
    private final UserService userService;
    private final ComplaintClassificationService classificationService;
    private final DuplicateDetectionService duplicateDetectionService;

    public TicketController(TicketService ticketService,
                            UserService userService,
                            ComplaintClassificationService classificationService,
                            DuplicateDetectionService duplicateDetectionService) {
        this.ticketService = ticketService;
        this.userService = userService;
        this.classificationService = classificationService;
        this.duplicateDetectionService = duplicateDetectionService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<TicketDto>> createTicket(
            @Valid @RequestBody CreateTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User student = userService.getUserEntity(authUser.getId());
        if (student.getApprovalStatus() == com.unis.user.ApprovalStatus.PENDING) {
            throw new com.unis.common.ForbiddenException("Your account is pending institutional approval. You cannot submit tickets until approved.");
        }
        TicketDto dto = ticketService.createTicket(request, student);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Ticket created successfully", dto));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<TicketDto>>> getTickets(
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Boolean isOverdue,
            @RequestParam(required = false) String search,
            @AuthenticationPrincipal CustomUserDetails authUser,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success(
                ticketService.getTickets(user, status, priority, category, isOverdue, search, pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<TicketDetailDto>> getTicketDetail(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success(ticketService.getTicketDetail(id, user)));
    }

    @PostMapping("/{id}/assign")
    public ResponseEntity<ApiResponse<TicketDto>> assignTicket(
            @PathVariable Long id,
            @Valid @RequestBody AssignTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Ticket assigned successfully",
                ticketService.assignTicket(id, request, actor)));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<TicketDto>> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateTicketStatusRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Ticket status updated successfully",
                ticketService.updateStatus(id, request, actor)));
    }

    @PostMapping("/{id}/reopen")
    public ResponseEntity<ApiResponse<TicketDto>> reopenTicket(
            @PathVariable Long id,
            @Valid @RequestBody ReopenTicketRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Ticket reopened successfully",
                ticketService.reopenTicket(id, request, actor)));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<TicketCommentDto>> addComment(
            @PathVariable Long id,
            @Valid @RequestBody AddCommentRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User author = userService.getUserEntity(authUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Comment added", ticketService.addComment(id, request, author)));
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Void>> followTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        ticketService.followTicket(id, user);
        return ResponseEntity.ok(ApiResponse.success("You are now following this ticket", null));
    }

    @DeleteMapping("/{id}/follow")
    public ResponseEntity<ApiResponse<Void>> unfollowTicket(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        ticketService.unfollowTicket(id, user);
        return ResponseEntity.ok(ApiResponse.success("Unfollowed ticket", null));
    }

    @PostMapping("/{id}/feedback")
    public ResponseEntity<ApiResponse<TicketFeedbackDto>> submitFeedback(
            @PathVariable Long id,
            @Valid @RequestBody TicketFeedbackRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User student = userService.getUserEntity(authUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Feedback submitted successfully",
                        ticketService.submitFeedback(id, request, student)));
    }

    @PostMapping("/classify")
    public ResponseEntity<ApiResponse<ComplaintClassificationService.ClassificationResult>> classifyComplaint(
            @RequestBody Map<String, String> body) {
        String title = body.get("title");
        String description = body.get("description");
        String location = body.get("location");
        return ResponseEntity.ok(ApiResponse.success(
                classificationService.classifyComplaint(title, description, location)));
    }

    @GetMapping("/similar")
    public ResponseEntity<ApiResponse<List<DuplicateDetectionService.DuplicateMatch>>> findSimilarTickets(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Long locationId,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String description) {
        return ResponseEntity.ok(ApiResponse.success(
                duplicateDetectionService.findPotentialDuplicates(category, locationId, title, description)));
    }
}
