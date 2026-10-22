package com.unis.governance;

import jakarta.validation.constraints.NotNull;

public class FounderSelfRevocationRequest {
    @NotNull(message = "Successor administrator ID is required")
    private Long successorAdminId;

    private String notes;

    public FounderSelfRevocationRequest() {}

    public Long getSuccessorAdminId() {
        return successorAdminId;
    }

    public void setSuccessorAdminId(Long successorAdminId) {
        this.successorAdminId = successorAdminId;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }
}
