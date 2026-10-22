package com.unis.lostfound;

import java.time.Instant;

public class ItemClaimDto {
    private Long id;
    private Long itemId;
    private String itemTitle;
    private String itemType;
    private Long claimantId;
    private String claimantName;
    private String claimantEmail;
    private String proofDetails;
    private String claimStatus;
    private Long reviewerId;
    private String reviewerName;
    private String reviewNotes;
    private Instant reviewedAt;
    private Instant createdAt;

    public ItemClaimDto() {
    }

    public static ItemClaimDto fromEntity(ItemClaim claim) {
        if (claim == null) return null;
        ItemClaimDto dto = new ItemClaimDto();
        dto.id = claim.getId();
        if (claim.getItem() != null) {
            dto.itemId = claim.getItem().getId();
            dto.itemTitle = claim.getItem().getTitle();
            dto.itemType = claim.getItem().getItemType();
        }
        if (claim.getClaimant() != null) {
            dto.claimantId = claim.getClaimant().getId();
            dto.claimantName = claim.getClaimant().getFullName();
            dto.claimantEmail = claim.getClaimant().getEmail();
        }
        dto.proofDetails = claim.getProofDetails();
        dto.claimStatus = claim.getClaimStatus();
        if (claim.getReviewer() != null) {
            dto.reviewerId = claim.getReviewer().getId();
            dto.reviewerName = claim.getReviewer().getFullName();
        }
        dto.reviewNotes = claim.getReviewNotes();
        dto.reviewedAt = claim.getReviewedAt();
        dto.createdAt = claim.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getItemId() {
        return itemId;
    }

    public String getItemTitle() {
        return itemTitle;
    }

    public String getItemType() {
        return itemType;
    }

    public Long getClaimantId() {
        return claimantId;
    }

    public String getClaimantName() {
        return claimantName;
    }

    public String getClaimantEmail() {
        return claimantEmail;
    }

    public String getProofDetails() {
        return proofDetails;
    }

    public String getClaimStatus() {
        return claimStatus;
    }

    public Long getReviewerId() {
        return reviewerId;
    }

    public String getReviewerName() {
        return reviewerName;
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
