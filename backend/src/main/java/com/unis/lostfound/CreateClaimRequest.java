package com.unis.lostfound;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateClaimRequest {

    @NotBlank(message = "Proof details are required to substantiate ownership")
    @Size(min = 10, message = "Please provide identifiable characteristics or proof of ownership")
    private String proofDetails;

    public CreateClaimRequest() {
    }

    public String getProofDetails() {
        return proofDetails;
    }

    public void setProofDetails(String proofDetails) {
        this.proofDetails = proofDetails;
    }
}
