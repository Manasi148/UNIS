package com.unis.lostfound;

import jakarta.validation.constraints.NotBlank;

public class ReviewClaimRequest {

    @NotBlank(message = "Review status is required (APPROVED, REJECTED, MORE_INFO_REQUIRED)")
    private String claimStatus;

    private String reviewNotes;

    public ReviewClaimRequest() {
    }

    public String getClaimStatus() {
        return claimStatus;
    }

    public void setClaimStatus(String claimStatus) {
        this.claimStatus = claimStatus;
    }

    public String getStatus() {
        return claimStatus;
    }

    public void setStatus(String status) {
        if (this.claimStatus == null || this.claimStatus.isBlank()) {
            this.claimStatus = status;
        }
    }

    public String getReviewNotes() {
        return reviewNotes;
    }

    public void setReviewNotes(String reviewNotes) {
        this.reviewNotes = reviewNotes;
    }
}
