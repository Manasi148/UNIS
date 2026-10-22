package com.unis.governance;

import com.unis.user.User;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "admin_removal_proposals")
public class AdminRemovalProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_admin_id", nullable = false)
    private User targetAdmin;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "proposer_admin_id", nullable = false)
    private User proposerAdmin;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, EXECUTED, CANCELLED

    @Column(name = "required_approvals", nullable = false)
    private int requiredApprovals = 4;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    @Column(name = "executed_at")
    private Instant executedAt;

    @OneToMany(mappedBy = "proposal", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<AdminRemovalApproval> approvals = new ArrayList<>();

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
    }

    public AdminRemovalProposal() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getTargetAdmin() {
        return targetAdmin;
    }

    public void setTargetAdmin(User targetAdmin) {
        this.targetAdmin = targetAdmin;
    }

    public User getProposerAdmin() {
        return proposerAdmin;
    }

    public void setProposerAdmin(User proposerAdmin) {
        this.proposerAdmin = proposerAdmin;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getRequiredApprovals() {
        return requiredApprovals;
    }

    public void setRequiredApprovals(int requiredApprovals) {
        this.requiredApprovals = requiredApprovals;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }

    public List<AdminRemovalApproval> getApprovals() {
        return approvals;
    }

    public void setApprovals(List<AdminRemovalApproval> approvals) {
        this.approvals = approvals;
    }
}
