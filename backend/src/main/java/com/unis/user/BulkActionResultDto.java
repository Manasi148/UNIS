package com.unis.user;

import java.util.ArrayList;
import java.util.List;

public class BulkActionResultDto {
    private int successCount;
    private int failureCount;
    private List<String> details = new ArrayList<>();
    private List<String> errors = new ArrayList<>();

    public BulkActionResultDto() {
    }

    public BulkActionResultDto(int successCount, int failureCount, List<String> details, List<String> errors) {
        this.successCount = successCount;
        this.failureCount = failureCount;
        this.details = details;
        this.errors = errors;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }

    public List<String> getDetails() {
        return details;
    }

    public void setDetails(List<String> details) {
        this.details = details;
    }

    public List<String> getErrors() {
        return errors;
    }

    public void setErrors(List<String> errors) {
        this.errors = errors;
    }
}
