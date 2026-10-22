package com.unis.notification;

import java.time.Instant;

public class NotificationDto {
    private Long id;
    private Long recipientId;
    private String notificationType;
    private String title;
    private String message;
    private String resourceType;
    private Long resourceId;
    private boolean isRead;
    private Instant createdAt;

    public NotificationDto() {
    }

    public static NotificationDto fromEntity(Notification entity) {
        if (entity == null) return null;
        NotificationDto dto = new NotificationDto();
        dto.id = entity.getId();
        dto.recipientId = entity.getRecipient() != null ? entity.getRecipient().getId() : null;
        dto.notificationType = entity.getNotificationType();
        dto.title = entity.getTitle();
        dto.message = entity.getMessage();
        dto.resourceType = entity.getResourceType();
        dto.resourceId = entity.getResourceId();
        dto.isRead = entity.isRead();
        dto.createdAt = entity.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public String getNotificationType() {
        return notificationType;
    }

    public String getTitle() {
        return title;
    }

    public String getMessage() {
        return message;
    }

    public String getResourceType() {
        return resourceType;
    }

    public Long getResourceId() {
        return resourceId;
    }

    public boolean isRead() {
        return isRead;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
