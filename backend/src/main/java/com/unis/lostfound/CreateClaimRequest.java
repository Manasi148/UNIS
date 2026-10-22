package com.unis.lostfound;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateClaimRequest {

    @NotBlank(message = "Proof details are required to substantiate ownership")
    @Size(min = 10, message = "Please provide identifiable characteristics or proof of ownership")
    private String proofDetails;

    private String claimDescription;

    public CreateClaimRequest() {
    }

    public String getProofDetails() {
        if ((proofDetails == null || proofDetails.isBlank()) && claimDescription != null) {
            return claimDescription;
        }
        return proofDetails;
    }

    public void setProofDetails(String proofDetails) {
        this.proofDetails = proofDetails;
    }

    public String getClaimDescription() {
        return claimDescription;
    }

    public void setClaimDescription(String claimDescription) {
        this.claimDescription = claimDescription;
        if (this.proofDetails == null || this.proofDetails.isBlank()) {
            this.proofDetails = claimDescription;
        }
    }
}
