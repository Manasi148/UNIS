package com.unis.governance;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

public class AdminRemovalProposalDto {
    private Long id;
    private Long targetAdminId;
    private String targetAdminName;
    private String targetAdminEmail;
    private boolean targetIsFounder;

    private Long proposerAdminId;
    private String proposerAdminName;
    private String proposerAdminEmail;

    private String reason;
    private String status;
    private int requiredApprovals;
    private int currentApprovalsCount;
    private String approvalRatio;

    private List<Long> approvedAdminIds = new ArrayList<>();
    private List<String> approvedAdminNames = new ArrayList<>();
    private boolean hasUserApproved;
    private boolean canUserApprove;

    private Instant createdAt;
    private Instant executedAt;

    public AdminRemovalProposalDto() {}

    public static AdminRemovalProposalDto fromEntity(AdminRemovalProposal proposal, Long currentUserId) {
        if (proposal == null) return null;

        AdminRemovalProposalDto dto = new AdminRemovalProposalDto();
        dto.setId(proposal.getId());
        dto.setTargetAdminId(proposal.getTargetAdmin().getId());
        dto.setTargetAdminName(proposal.getTargetAdmin().getFullName());
        dto.setTargetAdminEmail(proposal.getTargetAdmin().getEmail());
        dto.setTargetIsFounder(proposal.getTargetAdmin().isFounder());

        dto.setProposerAdminId(proposal.getProposerAdmin().getId());
        dto.setProposerAdminName(proposal.getProposerAdmin().getFullName());
        dto.setProposerAdminEmail(proposal.getProposerAdmin().getEmail());

        dto.setReason(proposal.getReason());
        dto.setStatus(proposal.getStatus());
        dto.setRequiredApprovals(proposal.getRequiredApprovals());

        int count = proposal.getApprovals() != null ? proposal.getApprovals().size() : 0;
        dto.setCurrentApprovalsCount(count);
        dto.setApprovalRatio(count + " of " + proposal.getRequiredApprovals());

        if (proposal.getApprovals() != null) {
            for (AdminRemovalApproval app : proposal.getApprovals()) {
                dto.getApprovedAdminIds().add(app.getAdmin().getId());
                dto.getApprovedAdminNames().add(app.getAdmin().getFullName());
            }
        }

        if (currentUserId != null) {
            boolean approved = dto.getApprovedAdminIds().contains(currentUserId);
            dto.setHasUserApproved(approved);
            boolean isTarget = proposal.getTargetAdmin().getId().equals(currentUserId);
            dto.setCanUserApprove("PENDING".equals(proposal.getStatus()) && !approved && !isTarget);
        }

        dto.setCreatedAt(proposal.getCreatedAt());
        dto.setExecutedAt(proposal.getExecutedAt());

        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getTargetAdminId() {
        return targetAdminId;
    }

    public void setTargetAdminId(Long targetAdminId) {
        this.targetAdminId = targetAdminId;
    }

    public String getTargetAdminName() {
        return targetAdminName;
    }

    public void setTargetAdminName(String targetAdminName) {
        this.targetAdminName = targetAdminName;
    }

    public String getTargetAdminEmail() {
        return targetAdminEmail;
    }

    public void setTargetAdminEmail(String targetAdminEmail) {
        this.targetAdminEmail = targetAdminEmail;
    }

    public boolean isTargetIsFounder() {
        return targetIsFounder;
    }

    public void setTargetIsFounder(boolean targetIsFounder) {
        this.targetIsFounder = targetIsFounder;
    }

    public Long getProposerAdminId() {
        return proposerAdminId;
    }

    public void setProposerAdminId(Long proposerAdminId) {
        this.proposerAdminId = proposerAdminId;
    }

    public String getProposerAdminName() {
        return proposerAdminName;
    }

    public void setProposerAdminName(String proposerAdminName) {
        this.proposerAdminName = proposerAdminName;
    }

    public String getProposerAdminEmail() {
        return proposerAdminEmail;
    }

    public void setProposerAdminEmail(String proposerAdminEmail) {
        this.proposerAdminEmail = proposerAdminEmail;
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

    public int getCurrentApprovalsCount() {
        return currentApprovalsCount;
    }

    public void setCurrentApprovalsCount(int currentApprovalsCount) {
        this.currentApprovalsCount = currentApprovalsCount;
    }

    public String getApprovalRatio() {
        return approvalRatio;
    }

    public void setApprovalRatio(String approvalRatio) {
        this.approvalRatio = approvalRatio;
    }

    public List<Long> getApprovedAdminIds() {
        return approvedAdminIds;
    }

    public void setApprovedAdminIds(List<Long> approvedAdminIds) {
        this.approvedAdminIds = approvedAdminIds;
    }

    public List<String> getApprovedAdminNames() {
        return approvedAdminNames;
    }

    public void setApprovedAdminNames(List<String> approvedAdminNames) {
        this.approvedAdminNames = approvedAdminNames;
    }

    public boolean isHasUserApproved() {
        return hasUserApproved;
    }

    public void setHasUserApproved(boolean hasUserApproved) {
        this.hasUserApproved = hasUserApproved;
    }

    public boolean isCanUserApprove() {
        return canUserApprove;
    }

    public void setCanUserApprove(boolean canUserApprove) {
        this.canUserApprove = canUserApprove;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(Instant executedAt) {
        this.executedAt = executedAt;
    }
}
