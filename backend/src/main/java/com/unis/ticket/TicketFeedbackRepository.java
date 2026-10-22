package com.unis.ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TicketFeedbackRepository extends JpaRepository<TicketFeedback, Long> {
    Optional<TicketFeedback> findByTicketId(Long ticketId);
    boolean existsByTicketId(Long ticketId);

    @Query("SELECT AVG(f.rating) FROM TicketFeedback f")
    Double calculateAverageRating();
}
