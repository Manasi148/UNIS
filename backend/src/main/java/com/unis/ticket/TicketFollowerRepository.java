package com.unis.ticket;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TicketFollowerRepository extends JpaRepository<TicketFollower, Long> {
    Optional<TicketFollower> findByTicketIdAndUserId(Long ticketId, Long userId);
    boolean existsByTicketIdAndUserId(Long ticketId, Long userId);
    void deleteByTicketIdAndUserId(Long ticketId, Long userId);
    List<TicketFollower> findByTicketId(Long ticketId);
}
