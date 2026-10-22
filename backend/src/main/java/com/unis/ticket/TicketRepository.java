package com.unis.ticket;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {

    Optional<Ticket> findByTicketReference(String ticketReference);

    @Query("SELECT t FROM Ticket t " +
           "LEFT JOIN FETCH t.createdBy " +
           "LEFT JOIN FETCH t.department " +
           "LEFT JOIN FETCH t.location " +
           "LEFT JOIN FETCH t.assignedTo " +
           "WHERE (:studentId IS NULL OR t.createdBy.id = :studentId) " +
           "AND (:departmentId IS NULL OR t.department.id = :departmentId) " +
           "AND (:assignedToId IS NULL OR t.assignedTo.id = :assignedToId) " +
           "AND (:status IS NULL OR t.status = :status) " +
           "AND (:priority IS NULL OR t.priority = :priority) " +
           "AND (:category IS NULL OR t.category = :category) " +
           "AND (:isOverdue IS NULL OR t.overdue = :isOverdue) " +
           "AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(t.ticketReference) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Ticket> filterTickets(
            @Param("studentId") Long studentId,
            @Param("departmentId") Long departmentId,
            @Param("assignedToId") Long assignedToId,
            @Param("status") TicketStatus status,
            @Param("priority") TicketPriority priority,
            @Param("category") String category,
            @Param("isOverdue") Boolean isOverdue,
            @Param("search") String search,
            Pageable pageable
    );

    List<Ticket> findByStatusNot(TicketStatus status);

    List<Ticket> findByOverdueFalseAndStatusNotInAndTargetResolutionAtBefore(
            List<TicketStatus> completedStatuses, Instant now);

    long countByStatus(TicketStatus status);
    long countByDepartmentIdAndStatus(Long departmentId, TicketStatus status);
    long countByCreatedById(Long studentId);
    long countByCreatedByIdAndStatus(Long studentId, TicketStatus status);
    long countByAssignedToId(Long staffId);
    long countByAssignedToIdAndStatus(Long staffId, TicketStatus status);
    long countByOverdueTrue();
    long countByDepartmentIdAndOverdueTrue(Long departmentId);
}
