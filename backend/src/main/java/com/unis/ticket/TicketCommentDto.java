package com.unis.ticket;

import java.time.Instant;

public class TicketCommentDto {
    private Long id;
    private Long authorId;
    private String authorName;
    private String authorEmail;
    private String authorRole;
    private String commentText;
    private boolean internal;
    private Instant createdAt;

    public TicketCommentDto() {
    }

    public static TicketCommentDto fromEntity(TicketComment comment) {
        if (comment == null) return null;
        TicketCommentDto dto = new TicketCommentDto();
        dto.id = comment.getId();
        if (comment.getAuthor() != null) {
            dto.authorId = comment.getAuthor().getId();
            dto.authorName = comment.getAuthor().getFullName();
            dto.authorEmail = comment.getAuthor().getEmail();
            dto.authorRole = comment.getAuthor().getRole().name();
        }
        dto.commentText = comment.getCommentText();
        dto.internal = comment.isInternal();
        dto.createdAt = comment.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getAuthorEmail() {
        return authorEmail;
    }

    public String getAuthorRole() {
        return authorRole;
    }

    public String getCommentText() {
        return commentText;
    }

    public boolean isInternal() {
        return internal;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
