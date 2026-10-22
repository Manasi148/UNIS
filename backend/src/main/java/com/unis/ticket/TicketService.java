package com.unis.ticket;

import com.unis.audit.AuditService;
import com.unis.common.BadRequestException;
import com.unis.common.ForbiddenException;
import com.unis.common.PagedResponse;
import com.unis.common.ResourceNotFoundException;
import com.unis.department.Department;
import com.unis.department.DepartmentRepository;
import com.unis.location.CampusLocation;
import com.unis.location.CampusLocationRepository;
import com.unis.notification.NotificationService;
import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.Year;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final TicketCommentRepository ticketCommentRepository;
    private final TicketFollowerRepository ticketFollowerRepository;
    private final TicketFeedbackRepository ticketFeedbackRepository;
    private final DepartmentRepository departmentRepository;
    private final CampusLocationRepository campusLocationRepository;
    private final UserRepository userRepository;
    private final SlaManagementService slaManagementService;
    private final NotificationService notificationService;
    private final AuditService auditService;

    private static final AtomicLong REF_COUNTER = new AtomicLong(System.currentTimeMillis() % 10000);

    public TicketService(TicketRepository ticketRepository,
                         TicketHistoryRepository ticketHistoryRepository,
                         TicketCommentRepository ticketCommentRepository,
                         TicketFollowerRepository ticketFollowerRepository,
                         TicketFeedbackRepository ticketFeedbackRepository,
                         DepartmentRepository departmentRepository,
                         CampusLocationRepository campusLocationRepository,
                         UserRepository userRepository,
                         SlaManagementService slaManagementService,
                         NotificationService notificationService,
                         AuditService auditService) {
        this.ticketRepository = ticketRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
        this.ticketCommentRepository = ticketCommentRepository;
        this.ticketFollowerRepository = ticketFollowerRepository;
        this.ticketFeedbackRepository = ticketFeedbackRepository;
        this.departmentRepository = departmentRepository;
        this.campusLocationRepository = campusLocationRepository;
        this.userRepository = userRepository;
        this.slaManagementService = slaManagementService;
        this.notificationService = notificationService;
        this.auditService = auditService;
    }

    private synchronized String generateTicketReference() {
        int year = Year.now().getValue();
        long count = REF_COUNTER.incrementAndGet();
        return String.format("UNIS-%d-%04d", year, count % 10000);
    }

    @Transactional
    public TicketDto createTicket(CreateTicketRequest request, User studentUser) {
        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId())
                    .orElse(null);
        }

        CampusLocation location = null;
        if (request.getLocationId() != null) {
            location = campusLocationRepository.findById(request.getLocationId())
                    .orElse(null);
        }

        TicketPriority priority = request.getPriority() != null ? request.getPriority() : TicketPriority.MEDIUM;
        Instant now = Instant.now();
        Instant deadline = slaManagementService.calculateDeadline(priority, now);

        Ticket ticket = new Ticket();
        ticket.setTicketReference(generateTicketReference());
        ticket.setTitle(request.getTitle().trim());
        ticket.setDescription(request.getDescription().trim());
        ticket.setCategory(request.getCategory().trim());
        ticket.setPriority(priority);
        ticket.setStatus(TicketStatus.SUBMITTED);
        ticket.setCreatedBy(studentUser);
        ticket.setDepartment(dept);
        ticket.setLocation(location);
        ticket.setAttachmentUrl(request.getAttachmentUrl());
        ticket.setTargetResolutionAt(deadline);

        Ticket saved = ticketRepository.save(ticket);

        // Record history event
        TicketHistory history = new TicketHistory(
                saved, studentUser, "CREATED", null, "SUBMITTED",
                "Ticket reported with priority " + priority + " and SLA deadline " + deadline
        );
        ticketHistoryRepository.save(history);

        // Notify Department Head if department assigned
        if (dept != null) {
            List<User> heads = userRepository.findByDepartmentIdAndRole(dept.getId(), Role.DEPARTMENT_HEAD);
            for (User head : heads) {
                notificationService.createNotification(
                        head,
                        "TICKET_CREATED",
                        "New Problem Reported: " + saved.getTicketReference(),
                        "A new ticket '" + saved.getTitle() + "' has been lodged in your department.",
                        "TICKET",
                        saved.getId()
                );
            }
        }

        // Notify student of ticket creation
        notificationService.createNotification(
                studentUser,
                "TICKET_CREATED",
                "Ticket Lodged: " + saved.getTicketReference(),
                "Your problem report has been assigned reference " + saved.getTicketReference() + ".",
                "TICKET",
                saved.getId()
        );

        auditService.log(studentUser, "CREATE_TICKET", "TICKET", saved.getId(),
                "Created ticket " + saved.getTicketReference(), null);

        return TicketDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public PagedResponse<TicketDto> getTickets(User currentUser,
                                              TicketStatus status,
                                              TicketPriority priority,
                                              String category,
                                              Boolean isOverdue,
                                              String search,
                                              Pageable pageable) {
        Long studentFilter = null;
        Long deptFilter = null;
        Long assignedFilter = null;

        if (currentUser.getRole() == Role.STUDENT) {
            // Students can only see their own tickets
            studentFilter = currentUser.getId();
        } else if (currentUser.getRole() == Role.DEPARTMENT_HEAD) {
            // Department Head sees tickets for their department
            if (currentUser.getDepartment() != null) {
                deptFilter = currentUser.getDepartment().getId();
            }
        }
        // ADMIN has unrestricted view (all filters null by default unless specified)

        Page<Ticket> page = ticketRepository.filterTickets(
                studentFilter, deptFilter, assignedFilter,
                status, priority, category, isOverdue, search, pageable
        );

        return PagedResponse.of(page.map(TicketDto::fromEntity));
    }

    @Transactional(readOnly = true)
    public TicketDetailDto getTicketDetail(Long ticketId, User currentUser) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        // Enforce Object-level authorization
        verifyTicketAccess(ticket, currentUser);

        boolean isStaffOrAbove = currentUser.getRole() != Role.STUDENT;

        // Fetch comments with internal visibility rule enforced
        List<TicketComment> comments = isStaffOrAbove
                ? ticketCommentRepository.findAllByTicketIdOrderByCreatedAtAsc(ticketId)
                : ticketCommentRepository.findPublicByTicketIdOrderByCreatedAtAsc(ticketId);

        List<TicketCommentDto> commentDtos = comments.stream()
                .map(TicketCommentDto::fromEntity)
                .collect(Collectors.toList());

        List<TicketHistoryDto> historyDtos = ticketHistoryRepository.findByTicketIdOrderByCreatedAtAsc(ticketId)
                .stream().map(TicketHistoryDto::fromEntity).collect(Collectors.toList());

        TicketFeedbackDto feedbackDto = ticketFeedbackRepository.findByTicketId(ticketId)
                .map(TicketFeedbackDto::fromEntity).orElse(null);

        boolean isFollowed = ticketFollowerRepository.existsByTicketIdAndUserId(ticketId, currentUser.getId());

        return TicketDetailDto.fromEntity(ticket, commentDtos, historyDtos, feedbackDto, isFollowed);
    }

    @Transactional
    public TicketDto assignTicket(Long ticketId, AssignTicketRequest request, User actor) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        if (actor.getRole() == Role.STUDENT) {
            throw new ForbiddenException("Students are not authorized to assign tickets");
        }

        if (actor.getRole() == Role.DEPARTMENT_HEAD && ticket.getDepartment() != null) {
            if (actor.getDepartment() == null || !actor.getDepartment().getId().equals(ticket.getDepartment().getId())) {
                throw new ForbiddenException("Department heads can only assign tickets within their own department");
            }
        }

        User staff = userRepository.findById(request.getAssignedToId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff user not found"));

        if (staff.getRole() != Role.DEPARTMENT_HEAD && staff.getRole() != Role.ADMIN) {
            throw new BadRequestException("Can only assign tickets to department heads or administrators");
        }

        String oldAssigneeName = ticket.getAssignedTo() != null ? ticket.getAssignedTo().getFullName() : "UNASSIGNED";
        ticket.setAssignedTo(staff);

        if (ticket.getStatus() == TicketStatus.SUBMITTED) {
            ticket.setStatus(TicketStatus.ASSIGNED);
        }

        Ticket saved = ticketRepository.save(ticket);

        // Record history
        TicketHistory history = new TicketHistory(
                saved, actor, "ASSIGNED", oldAssigneeName, staff.getFullName(), request.getNotes()
        );
        ticketHistoryRepository.save(history);

        // Notify assigned staff
        notificationService.createNotification(
                staff,
                "TICKET_ASSIGNED",
                "New Assignment: " + saved.getTicketReference(),
                "You have been assigned to handle '" + saved.getTitle() + "'.",
                "TICKET",
                saved.getId()
        );

        // Notify ticket creator
        notificationService.createNotification(
                saved.getCreatedBy(),
                "TICKET_ASSIGNED",
                "Ticket Assigned: " + saved.getTicketReference(),
                "Your ticket has been assigned to staff officer " + staff.getFullName() + ".",
                "TICKET",
                saved.getId()
        );

        auditService.log(actor, "ASSIGN_TICKET", "TICKET", saved.getId(),
                "Assigned ticket " + saved.getTicketReference() + " to " + staff.getEmail(), null);

        return TicketDto.fromEntity(saved);
    }

    @Transactional
    public TicketDto updateStatus(Long ticketId, UpdateTicketStatusRequest request, User actor) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        if (actor.getRole() == Role.STUDENT) {
            throw new ForbiddenException("Students cannot directly update ticket status. Use resolution confirmation or reopen.");
        }

        TicketStatus oldStatus = ticket.getStatus();
        TicketStatus newStatus = request.getStatus();

        // State Machine validation
        validateStatusTransition(oldStatus, newStatus);

        ticket.setStatus(newStatus);
        if (newStatus == TicketStatus.RESOLVED) {
            if (request.getResolutionSummary() == null || request.getResolutionSummary().isBlank()) {
                throw new BadRequestException("A resolution summary is required when marking a ticket as Resolved");
            }
            ticket.setResolutionSummary(request.getResolutionSummary().trim());
            ticket.setResolvedAt(Instant.now());
        } else if (newStatus == TicketStatus.CLOSED) {
            ticket.setClosedAt(Instant.now());
        }

        Ticket saved = ticketRepository.save(ticket);

        // History
        TicketHistory history = new TicketHistory(
                saved, actor, "STATUS_CHANGED", oldStatus.name(), newStatus.name(),
                request.getComments() != null ? request.getComments() : request.getResolutionSummary()
        );
        ticketHistoryRepository.save(history);

        // Notify ticket creator
        notificationService.createNotification(
                saved.getCreatedBy(),
                "TICKET_STATUS_UPDATED",
                "Ticket Status Updated: " + saved.getTicketReference(),
                "Your ticket status changed from " + oldStatus + " to " + newStatus + ".",
                "TICKET",
                saved.getId()
        );

        // Notify followers
        notifyFollowers(saved, "Status changed to " + newStatus);

        auditService.log(actor, "UPDATE_TICKET_STATUS", "TICKET", saved.getId(),
                "Status changed from " + oldStatus + " to " + newStatus, null);

        return TicketDto.fromEntity(saved);
    }

    @Transactional
    public TicketDto reopenTicket(Long ticketId, ReopenTicketRequest request, User actor) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        // Only creator, staff, or admin can reopen
        if (actor.getRole() == Role.STUDENT && !ticket.getCreatedBy().getId().equals(actor.getId())) {
            throw new ForbiddenException("You cannot reopen another student's ticket");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Only Resolved or Closed tickets can be reopened");
        }

        TicketStatus oldStatus = ticket.getStatus();
        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticket.setReopenedCount(ticket.getReopenedCount() + 1);
        ticket.setReopenReason(request.getReason().trim());
        ticket.setResolvedAt(null);
        ticket.setClosedAt(null);

        Ticket saved = ticketRepository.save(ticket);

        TicketHistory history = new TicketHistory(
                saved, actor, "REOPENED", oldStatus.name(), "IN_PROGRESS",
                "Reopen Reason: " + request.getReason()
        );
        ticketHistoryRepository.save(history);

        // Notify assigned staff
        if (saved.getAssignedTo() != null) {
            notificationService.createNotification(
                    saved.getAssignedTo(),
                    "TICKET_REOPENED",
                    "Ticket Reopened: " + saved.getTicketReference(),
                    "Ticket '" + saved.getTitle() + "' was reopened: " + request.getReason(),
                    "TICKET",
                    saved.getId()
            );
        }

        auditService.log(actor, "REOPEN_TICKET", "TICKET", saved.getId(),
                "Ticket reopened. Reason: " + request.getReason(), null);

        return TicketDto.fromEntity(saved);
    }

    @Transactional
    public TicketCommentDto addComment(Long ticketId, AddCommentRequest request, User author) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with ID: " + ticketId));

        verifyTicketAccess(ticket, author);

        boolean internalFlag = request.isInternal();
        // Students can NEVER add internal notes
        if (author.getRole() == Role.STUDENT) {
            internalFlag = false;
        }

        TicketComment comment = new TicketComment(ticket, author, request.getCommentText().trim(), internalFlag);
        TicketComment saved = ticketCommentRepository.save(comment);

        // Add history record
        TicketHistory history = new TicketHistory(
                ticket, author, internalFlag ? "INTERNAL_NOTE_ADDED" : "PUBLIC_COMMENT_ADDED",
                null, null, request.getCommentText()
        );
        ticketHistoryRepository.save(history);

        // If public comment, notify other party
        if (!internalFlag) {
            if (author.getId().equals(ticket.getCreatedBy().getId())) {
                // Student commented, notify assigned staff
                if (ticket.getAssignedTo() != null) {
                    notificationService.createNotification(
                            ticket.getAssignedTo(),
                            "TICKET_COMMENT",
                            "New Comment on " + ticket.getTicketReference(),
                            author.getFullName() + ": " + truncateText(request.getCommentText(), 80),
                            "TICKET",
                            ticket.getId()
                    );
                }
            } else {
                // Staff commented, notify student
                notificationService.createNotification(
                        ticket.getCreatedBy(),
                        "TICKET_COMMENT",
                        "New Staff Update on " + ticket.getTicketReference(),
                        author.getFullName() + ": " + truncateText(request.getCommentText(), 80),
                        "TICKET",
                        ticket.getId()
                );
            }
            notifyFollowers(ticket, "New comment added by " + author.getFullName());
        }

        return TicketCommentDto.fromEntity(saved);
    }

    @Transactional
    public void followTicket(Long ticketId, User user) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!ticketFollowerRepository.existsByTicketIdAndUserId(ticketId, user.getId())) {
            TicketFollower follower = new TicketFollower(ticket, user);
            ticketFollowerRepository.save(follower);
        }
    }

    @Transactional
    public void unfollowTicket(Long ticketId, User user) {
        ticketFollowerRepository.deleteByTicketIdAndUserId(ticketId, user.getId());
    }

    @Transactional
    public TicketFeedbackDto submitFeedback(Long ticketId, TicketFeedbackRequest request, User student) {
        Ticket ticket = ticketRepository.findById(ticketId)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        if (!ticket.getCreatedBy().getId().equals(student.getId())) {
            throw new ForbiddenException("Only the student who reported this issue can submit resolution feedback");
        }

        if (ticket.getStatus() != TicketStatus.RESOLVED && ticket.getStatus() != TicketStatus.CLOSED) {
            throw new BadRequestException("Feedback can only be submitted once the ticket has been marked Resolved or Closed");
        }

        if (ticketFeedbackRepository.existsByTicketId(ticketId)) {
            throw new BadRequestException("Feedback has already been recorded for this ticket");
        }

        TicketFeedback feedback = new TicketFeedback(
                ticket, student, request.getRating(),
                request.getComments() != null ? request.getComments().trim() : null
        );
        TicketFeedback saved = ticketFeedbackRepository.save(feedback);

        TicketHistory history = new TicketHistory(
                ticket, student, "FEEDBACK_SUBMITTED", null, request.getRating() + " Stars",
                request.getComments()
        );
        ticketHistoryRepository.save(history);

        return TicketFeedbackDto.fromEntity(saved);
    }

    private void verifyTicketAccess(Ticket ticket, User user) {
        if (user.getRole() == Role.ADMIN) return;
        if (user.getRole() == Role.STUDENT) {
            if (!ticket.getCreatedBy().getId().equals(user.getId()) &&
                !ticketFollowerRepository.existsByTicketIdAndUserId(ticket.getId(), user.getId())) {
                throw new ForbiddenException("You are not authorized to view this ticket");
            }
        } else if (user.getRole() == Role.DEPARTMENT_HEAD) {
            if (ticket.getDepartment() != null && user.getDepartment() != null &&
                !ticket.getDepartment().getId().equals(user.getDepartment().getId())) {
                throw new ForbiddenException("Department head cannot inspect queues of other departments");
            }
        }
    }

    private void validateStatusTransition(TicketStatus oldStatus, TicketStatus newStatus) {
        if (oldStatus == newStatus) return;

        boolean valid = switch (oldStatus) {
            case SUBMITTED -> newStatus == TicketStatus.ASSIGNED || newStatus == TicketStatus.IN_PROGRESS;
            case ASSIGNED -> newStatus == TicketStatus.IN_PROGRESS || newStatus == TicketStatus.RESOLVED;
            case IN_PROGRESS -> newStatus == TicketStatus.RESOLVED || newStatus == TicketStatus.ASSIGNED;
            case RESOLVED -> newStatus == TicketStatus.CLOSED || newStatus == TicketStatus.IN_PROGRESS;
            case CLOSED -> newStatus == TicketStatus.IN_PROGRESS;
        };

        if (!valid) {
            throw new BadRequestException("Invalid institutional status transition from " + oldStatus + " to " + newStatus);
        }
    }

    private void notifyFollowers(Ticket ticket, String message) {
        List<TicketFollower> followers = ticketFollowerRepository.findByTicketId(ticket.getId());
        for (TicketFollower f : followers) {
            notificationService.createNotification(
                    f.getUser(),
                    "TICKET_STATUS_UPDATED",
                    "Update on Followed Ticket: " + ticket.getTicketReference(),
                    message,
                    "TICKET",
                    ticket.getId()
            );
        }
    }

    private String truncateText(String text, int max) {
        if (text == null) return "";
        return text.length() <= max ? text : text.substring(0, max) + "...";
    }
}
