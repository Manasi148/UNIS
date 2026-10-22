package com.unis.ticket;

import jakarta.validation.constraints.NotBlank;

public class ReopenTicketRequest {

    @NotBlank(message = "Reopen reason is required")
    private String reason;

    public ReopenTicketRequest() {
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
