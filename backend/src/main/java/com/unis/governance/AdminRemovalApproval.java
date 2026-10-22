package com.unis.governance;

import com.unis.user.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "admin_removal_approvals", uniqueConstraints = {
    @UniqueConstraint(name = "uq_proposal_admin", columnNames = {"proposal_id", "admin_id"})
})
public class AdminRemovalApproval {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposal_id", nullable = false)
    private AdminRemovalProposal proposal;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "admin_id", nullable = false)
    private User admin;

    @Column(name = "approved_at", nullable = false, updatable = false)
    private Instant approvedAt = Instant.now();

    public AdminRemovalApproval() {}

    public AdminRemovalApproval(AdminRemovalProposal proposal, User admin) {
        this.proposal = proposal;
        this.admin = admin;
        this.approvedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public AdminRemovalProposal getProposal() {
        return proposal;
    }

    public void setProposal(AdminRemovalProposal proposal) {
        this.proposal = proposal;
    }

    public User getAdmin() {
        return admin;
    }

    public void setAdmin(User admin) {
        this.admin = admin;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }
}
