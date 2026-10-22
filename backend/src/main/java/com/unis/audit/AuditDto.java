package com.unis.audit;

import java.time.Instant;

public class AuditDto {
    private Long id;
    private Long actorId;
    private String actorName;
    private String actorEmail;
    private String action;
    private String targetResource;
    private Long targetId;
    private String details;
    private String ipAddress;
    private Instant createdAt;

    public AuditDto() {
    }

    public static AuditDto fromEntity(AuditLog log) {
        if (log == null) return null;
        AuditDto dto = new AuditDto();
        dto.id = log.getId();
        if (log.getActor() != null) {
            dto.actorId = log.getActor().getId();
            dto.actorName = log.getActor().getFullName();
            dto.actorEmail = log.getActor().getEmail();
        }
        dto.action = log.getAction();
        dto.targetResource = log.getTargetResource();
        dto.targetId = log.getTargetId();
        dto.details = log.getDetails();
        dto.ipAddress = log.getIpAddress();
        dto.createdAt = log.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getActorId() {
        return actorId;
    }

    public String getActorName() {
        return actorName;
    }

    public String getActorEmail() {
        return actorEmail;
    }

    public String getAction() {
        return action;
    }

    public String getTargetResource() {
        return targetResource;
    }

    public Long getTargetId() {
        return targetId;
    }

    public String getDetails() {
        return details;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
