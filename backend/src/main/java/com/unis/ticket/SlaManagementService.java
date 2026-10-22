package com.unis.ticket;

import com.unis.notification.NotificationService;
import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
public class SlaManagementService {

    private static final Logger log = LoggerFactory.getLogger(SlaManagementService.class);

    private final TicketRepository ticketRepository;
    private final TicketHistoryRepository ticketHistoryRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Value("${unis.sla.critical-hours:4}")
    private int criticalHours;

    @Value("${unis.sla.high-hours:24}")
    private int highHours;

    @Value("${unis.sla.medium-hours:48}")
    private int mediumHours;

    @Value("${unis.sla.low-hours:72}")
    private int lowHours;

    public SlaManagementService(TicketRepository ticketRepository,
                                TicketHistoryRepository ticketHistoryRepository,
                                NotificationService notificationService,
                                UserRepository userRepository) {
        this.ticketRepository = ticketRepository;
        this.ticketHistoryRepository = ticketHistoryRepository;
        this.notificationService = notificationService;
        this.userRepository = userRepository;
    }

    public Instant calculateDeadline(TicketPriority priority, Instant baseTime) {
        int hours = switch (priority) {
            case CRITICAL -> criticalHours;
            case HIGH -> highHours;
            case MEDIUM -> mediumHours;
            case LOW -> lowHours;
        };
        return baseTime.plus(Duration.ofHours(hours));
    }

    @Scheduled(fixedRate = 60000) // Scan every 60 seconds for overdue tickets
    @Transactional
    public void evaluateOverdueTickets() {
        Instant now = Instant.now();
        List<TicketStatus> completedStatuses = List.of(TicketStatus.RESOLVED, TicketStatus.CLOSED);

        List<Ticket> overdueCandidates = ticketRepository.findByOverdueFalseAndStatusNotInAndTargetResolutionAtBefore(
                completedStatuses, now
        );

        if (overdueCandidates.isEmpty()) return;

        log.info("SLA Engine: Found {} ticket(s) crossing target resolution SLA", overdueCandidates.size());

        for (Ticket ticket : overdueCandidates) {
            ticket.setOverdue(true);
            ticket.setEscalationLevel(ticket.getEscalationLevel() + 1);
            ticketRepository.save(ticket);

            // Record escalation event in history
            TicketHistory history = new TicketHistory(
                    ticket,
                    null, // System automated event
                    "ESCALATED",
                    "OVERDUE_FALSE",
                    "OVERDUE_TRUE",
                    "Target resolution deadline exceeded (" + ticket.getTargetResolutionAt() + "). Escalation Level: " + ticket.getEscalationLevel()
            );
            ticketHistoryRepository.save(history);

            // Notify Department Head
            if (ticket.getDepartment() != null) {
                List<User> deptHeads = userRepository.findByDepartmentIdAndRole(
                        ticket.getDepartment().getId(), Role.DEPARTMENT_HEAD
                );
                for (User head : deptHeads) {
                    notificationService.createNotification(
                            head,
                            "TICKET_OVERDUE",
                            "SLA Escalation: " + ticket.getTicketReference(),
                            "Ticket '" + ticket.getTitle() + "' in " + ticket.getDepartment().getName() + " has exceeded its resolution SLA.",
                            "TICKET",
                            ticket.getId()
                    );
                }
            }

            // Also notify assigned staff if any
            if (ticket.getAssignedTo() != null) {
                notificationService.createNotification(
                        ticket.getAssignedTo(),
                        "TICKET_OVERDUE",
                        "Urgent: Assigned Ticket Overdue",
                        "Ticket " + ticket.getTicketReference() + " is overdue. Immediate resolution or progress update required.",
                        "TICKET",
                        ticket.getId()
                );
            }
        }
    }
}
