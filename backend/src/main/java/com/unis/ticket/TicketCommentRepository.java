package com.unis.ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketCommentRepository extends JpaRepository<TicketComment, Long> {

    @Query("SELECT c FROM TicketComment c LEFT JOIN FETCH c.author WHERE c.ticket.id = :ticketId ORDER BY c.createdAt ASC")
    List<TicketComment> findAllByTicketIdOrderByCreatedAtAsc(@Param("ticketId") Long ticketId);

    @Query("SELECT c FROM TicketComment c LEFT JOIN FETCH c.author WHERE c.ticket.id = :ticketId AND c.internal = false ORDER BY c.createdAt ASC")
    List<TicketComment> findPublicByTicketIdOrderByCreatedAtAsc(@Param("ticketId") Long ticketId);
}
