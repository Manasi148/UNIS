package com.unis.governance;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ProposeRemovalRequest {
    @NotNull(message = "Target administrator ID is required")
    private Long targetAdminId;

    @NotBlank(message = "Reason for proposed removal is required")
    private String reason;

    public ProposeRemovalRequest() {}

    public Long getTargetAdminId() {
        return targetAdminId;
    }

    public void setTargetAdminId(Long targetAdminId) {
        this.targetAdminId = targetAdminId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
