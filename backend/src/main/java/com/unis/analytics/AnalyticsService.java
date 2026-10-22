package com.unis.analytics;

import com.unis.department.Department;
import com.unis.department.DepartmentRepository;
import com.unis.location.CampusLocation;
import com.unis.location.CampusLocationRepository;
import com.unis.lostfound.ItemClaimRepository;
import com.unis.lostfound.LostFoundItemRepository;
import com.unis.ticket.Ticket;
import com.unis.ticket.TicketPriority;
import com.unis.ticket.TicketRepository;
import com.unis.ticket.TicketStatus;
import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CampusLocationRepository locationRepository;
    private final LostFoundItemRepository lostFoundItemRepository;
    private final ItemClaimRepository claimRepository;

    public AnalyticsService(TicketRepository ticketRepository,
                            UserRepository userRepository,
                            DepartmentRepository departmentRepository,
                            CampusLocationRepository locationRepository,
                            LostFoundItemRepository lostFoundItemRepository,
                            ItemClaimRepository claimRepository) {
        this.ticketRepository = ticketRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.locationRepository = locationRepository;
        this.lostFoundItemRepository = lostFoundItemRepository;
        this.claimRepository = claimRepository;
    }

    @Transactional(readOnly = true)
    public AnalyticsDto.OverviewStats getOverviewStats(User currentUser) {
        AnalyticsDto.OverviewStats stats = new AnalyticsDto.OverviewStats();

        List<Ticket> allTickets = ticketRepository.findAll();

        // Scope tickets if non-admin
        List<Ticket> scopedTickets = allTickets;
        if (currentUser.getRole() == Role.STUDENT) {
            scopedTickets = allTickets.stream()
                    .filter(t -> t.getCreatedBy().getId().equals(currentUser.getId()))
                    .collect(Collectors.toList());
        } else if (currentUser.getRole() == Role.DEPARTMENT_HEAD && currentUser.getDepartment() != null) {
            scopedTickets = allTickets.stream()
                    .filter(t -> t.getDepartment() != null && t.getDepartment().getId().equals(currentUser.getDepartment().getId()))
                    .collect(Collectors.toList());
        }

        stats.setTotalTickets(scopedTickets.size());
        long openTickets = scopedTickets.stream().filter(t -> t.getStatus() == TicketStatus.SUBMITTED || t.getStatus() == TicketStatus.ASSIGNED).count();
        long inProgressTickets = scopedTickets.stream().filter(t -> t.getStatus() == TicketStatus.IN_PROGRESS).count();
        stats.setOpenTickets(openTickets);
        stats.setInProgressTickets(inProgressTickets);
        stats.setOpenOrInProgressTickets(openTickets + inProgressTickets);
        stats.setResolvedTickets(scopedTickets.stream().filter(t -> t.getStatus() == TicketStatus.RESOLVED).count());
        stats.setClosedTickets(scopedTickets.stream().filter(t -> t.getStatus() == TicketStatus.CLOSED).count());
        stats.setOverdueTickets(scopedTickets.stream().filter(Ticket::isOverdue).count());

        // Calculate average resolution time for resolved/closed tickets
        List<Ticket> resolvedList = scopedTickets.stream()
                .filter(t -> t.getResolvedAt() != null)
                .collect(Collectors.toList());

        if (!resolvedList.isEmpty()) {
            double totalHours = 0;
            long metSlaCount = 0;
            for (Ticket t : resolvedList) {
                Duration dur = Duration.between(t.getCreatedAt(), t.getResolvedAt());
                totalHours += Math.max(0.1, dur.toMinutes() / 60.0);

                if (t.getTargetResolutionAt() != null && t.getResolvedAt().isBefore(t.getTargetResolutionAt())) {
                    metSlaCount++;
                }
            }
            stats.setAverageResolutionHours(Math.round((totalHours / resolvedList.size()) * 10.0) / 10.0);
            stats.setSlaComplianceRate(Math.round(((double) metSlaCount / resolvedList.size()) * 1000.0) / 10.0);
        } else {
            stats.setAverageResolutionHours(0.0);
            stats.setSlaComplianceRate(100.0);
        }

        stats.setTotalUsers(userRepository.count());
        stats.setTotalDepartments(departmentRepository.count());
        stats.setLostFoundItemsCount(lostFoundItemRepository.count());

        // Practical real student metrics
        stats.setTotalStudents(userRepository.countByRole(Role.STUDENT));
        stats.setApprovedStudents(userRepository.countByRoleAndApprovalStatus(Role.STUDENT, com.unis.user.ApprovalStatus.APPROVED));
        stats.setPendingStudents(userRepository.countByRoleAndApprovalStatus(Role.STUDENT, com.unis.user.ApprovalStatus.PENDING));
        stats.setRejectedStudents(userRepository.countByRoleAndApprovalStatus(Role.STUDENT, com.unis.user.ApprovalStatus.REJECTED));
        stats.setInactiveStudents(userRepository.countByRoleAndActive(Role.STUDENT, false));

        // Lost & Found practical metrics
        long activeLost = lostFoundItemRepository.countByItemTypeAndStatus("LOST", "OPEN");
        long activeFound = lostFoundItemRepository.countByItemTypeAndStatus("FOUND", "OPEN");
        stats.setActiveLostItemsCount(activeLost);
        stats.setActiveFoundItemsCount(activeFound);
        stats.setTotalActiveLostFoundCount(activeLost + activeFound);
        stats.setPendingClaimsCount(claimRepository.countByClaimStatus("PENDING"));
        stats.setResolvedLostFoundCount(lostFoundItemRepository.countByStatus("RETURNED") + lostFoundItemRepository.countByStatus("RESOLVED"));

        // Status counts breakdown map
        Map<String, Long> statusCounts = new HashMap<>();
        for (TicketStatus ts : TicketStatus.values()) {
            statusCounts.put(ts.name(), scopedTickets.stream().filter(t -> t.getStatus() == ts).count());
        }
        stats.setTicketStatusCounts(statusCounts);

        // Recent 5 pending students
        List<User> pendingUsers = userRepository.findByApprovalStatus(com.unis.user.ApprovalStatus.PENDING).stream()
                .filter(u -> u.getRole() == Role.STUDENT)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
        stats.setRecentPendingStudents(pendingUsers.stream().map(com.unis.user.UserDto::fromEntity).collect(Collectors.toList()));

        // Recent 5 tickets
        List<Ticket> recentTicketsList = scopedTickets.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
        stats.setRecentTickets(recentTicketsList.stream().map(com.unis.ticket.TicketDto::fromEntity).collect(Collectors.toList()));

        // Recent 5 lost & found items
        List<com.unis.lostfound.LostFoundItem> recentLfList = lostFoundItemRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(5)
                .collect(Collectors.toList());
        stats.setRecentLostFound(recentLfList.stream().map(com.unis.lostfound.LostFoundDto::fromEntity).collect(Collectors.toList()));

        return stats;
    }

    @Transactional(readOnly = true)
    public List<AnalyticsDto.ChartDataPoint> getTicketsByCategory() {
        List<Ticket> tickets = ticketRepository.findAll();
        Map<String, Long> categoryCounts = tickets.stream()
                .collect(Collectors.groupingBy(Ticket::getCategory, Collectors.counting()));

        return categoryCounts.entrySet().stream()
                .map(e -> new AnalyticsDto.ChartDataPoint(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnalyticsDto.ChartDataPoint> getTicketsByDepartment() {
        List<Ticket> tickets = ticketRepository.findAll();
        Map<String, Long> deptCounts = tickets.stream()
                .filter(t -> t.getDepartment() != null)
                .collect(Collectors.groupingBy(t -> t.getDepartment().getName(), Collectors.counting()));

        return deptCounts.entrySet().stream()
                .map(e -> new AnalyticsDto.ChartDataPoint(e.getKey(), e.getValue()))
                .sorted((a, b) -> Long.compare(b.getValue(), a.getValue()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnalyticsDto.ChartDataPoint> getMonthlyTrends() {
        List<Ticket> tickets = ticketRepository.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy").withZone(ZoneId.of("UTC"));

        Map<String, Long> monthlyCounts = new TreeMap<>();
        for (Ticket t : tickets) {
            String month = formatter.format(t.getCreatedAt());
            monthlyCounts.put(month, monthlyCounts.getOrDefault(month, 0L) + 1);
        }

        return monthlyCounts.entrySet().stream()
                .map(e -> new AnalyticsDto.ChartDataPoint(e.getKey(), e.getValue()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AnalyticsDto.StaffWorkload> getStaffWorkload() {
        List<User> staffMembers = userRepository.findByRole(Role.DEPARTMENT_HEAD);
        List<Ticket> tickets = ticketRepository.findAll();

        List<AnalyticsDto.StaffWorkload> workloads = new ArrayList<>();
        for (User staff : staffMembers) {
            long assigned = tickets.stream().filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(staff.getId())).count();
            long inProgress = tickets.stream().filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(staff.getId()) && t.getStatus() == TicketStatus.IN_PROGRESS).count();
            long resolved = tickets.stream().filter(t -> t.getAssignedTo() != null && t.getAssignedTo().getId().equals(staff.getId()) && t.getStatus() == TicketStatus.RESOLVED).count();

            String dept = staff.getDepartment() != null ? staff.getDepartment().getName() : "Unassigned";
            workloads.add(new AnalyticsDto.StaffWorkload(staff.getId(), staff.getFullName(), dept, assigned, inProgress, resolved));
        }

        workloads.sort((a, b) -> Long.compare(b.getAssignedCount(), a.getAssignedCount()));
        return workloads;
    }

    @Transactional(readOnly = true)
    public List<AnalyticsDto.HotspotDto> getCampusHotspots() {
        List<Ticket> tickets = ticketRepository.findAll();

        // Group tickets by location ID
        Map<CampusLocation, List<Ticket>> locationTickets = tickets.stream()
                .filter(t -> t.getLocation() != null)
                .collect(Collectors.groupingBy(Ticket::getLocation));

        List<AnalyticsDto.HotspotDto> hotspots = new ArrayList<>();

        for (Map.Entry<CampusLocation, List<Ticket>> entry : locationTickets.entrySet()) {
            CampusLocation loc = entry.getKey();
            List<Ticket> locList = entry.getValue();

            long count = locList.size();
            long overdue = locList.stream().filter(Ticket::isOverdue).count();

            // Find top category in this location
            Map<String, Long> catCounts = locList.stream()
                    .collect(Collectors.groupingBy(Ticket::getCategory, Collectors.counting()));
            String topCategory = catCounts.entrySet().stream()
                    .max(Map.Entry.comparingByValue())
                    .map(Map.Entry::getKey)
                    .orElse("Various");

            String severity;
            if (count >= 3 || overdue >= 1) {
                severity = "HIGH";
            } else if (count >= 2) {
                severity = "MEDIUM";
            } else {
                severity = "LOW";
            }

            String explanation = String.format(
                    "Identified %s hotspot: %d complaint(s) reported in %s (%s, %s) with primary recurrence in %s.",
                    severity, count, loc.getName(), loc.getBuilding(), loc.getRoomNumber(), topCategory
            );

            hotspots.add(new AnalyticsDto.HotspotDto(
                    loc.getId(),
                    loc.getBuilding(),
                    loc.getRoomNumber(),
                    loc.getName(),
                    count,
                    overdue,
                    topCategory,
                    severity,
                    explanation
            ));
        }

        // Sort descending by complaint count, then overdue
        hotspots.sort((a, b) -> {
            int cmp = Long.compare(b.getComplaintCount(), a.getComplaintCount());
            return cmp != 0 ? cmp : Long.compare(b.getOverdueCount(), a.getOverdueCount());
        });

        return hotspots;
    }
}
