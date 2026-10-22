package com.unis.ticket;

import com.unis.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ticket_followers", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ticket_id", "user_id"})
})
public class TicketFollower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ticket_id", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "followed_at", nullable = false, updatable = false)
    private Instant followedAt = Instant.now();

    public TicketFollower() {
    }

    public TicketFollower(Ticket ticket, User user) {
        this.ticket = ticket;
        this.user = user;
        this.followedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Ticket getTicket() {
        return ticket;
    }

    public void setTicket(Ticket ticket) {
        this.ticket = ticket;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Instant getFollowedAt() {
        return followedAt;
    }

    public void setFollowedAt(Instant followedAt) {
        this.followedAt = followedAt;
    }
}
