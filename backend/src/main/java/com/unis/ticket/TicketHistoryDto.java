package com.unis.ticket;

import java.time.Instant;

public class TicketHistoryDto {
    private Long id;
    private Long actorId;
    private String actorName;
    private String actorRole;
    private String eventType;
    private String oldValue;
    private String newValue;
    private String comments;
    private Instant createdAt;

    public TicketHistoryDto() {
    }

    public static TicketHistoryDto fromEntity(TicketHistory history) {
        if (history == null) return null;
        TicketHistoryDto dto = new TicketHistoryDto();
        dto.id = history.getId();
        if (history.getActor() != null) {
            dto.actorId = history.getActor().getId();
            dto.actorName = history.getActor().getFullName();
            dto.actorRole = history.getActor().getRole().name();
        } else {
            dto.actorName = "UNIS System Automated";
            dto.actorRole = "SYSTEM";
        }
        dto.eventType = history.getEventType();
        dto.oldValue = history.getOldValue();
        dto.newValue = history.getNewValue();
        dto.comments = history.getComments();
        dto.createdAt = history.getCreatedAt();
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

    public String getActorRole() {
        return actorRole;
    }

    public String getEventType() {
        return eventType;
    }

    public String getOldValue() {
        return oldValue;
    }

    public String getNewValue() {
        return newValue;
    }

    public String getComments() {
        return comments;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
