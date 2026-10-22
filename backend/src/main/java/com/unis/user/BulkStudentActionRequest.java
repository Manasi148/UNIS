package com.unis.user;

import jakarta.validation.constraints.NotEmpty;
import java.util.List;

public class BulkStudentActionRequest {

    @NotEmpty(message = "At least one student ID must be selected")
    private List<Long> studentIds;

    private String reason;
    private Long assignedDepartmentId;

    public BulkStudentActionRequest() {
    }

    public List<Long> getStudentIds() {
        return studentIds;
    }

    public void setStudentIds(List<Long> studentIds) {
        this.studentIds = studentIds;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public Long getAssignedDepartmentId() {
        return assignedDepartmentId;
    }

    public void setAssignedDepartmentId(Long assignedDepartmentId) {
        this.assignedDepartmentId = assignedDepartmentId;
    }
}
