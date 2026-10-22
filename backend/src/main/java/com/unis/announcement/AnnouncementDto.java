package com.unis.announcement;

import java.time.Instant;

public class AnnouncementDto {
    private Long id;
    private String title;
    private String body;
    private String category;
    private Long authorId;
    private String authorName;
    private String targetRole;
    private Long departmentId;
    private String departmentName;
    private boolean pinned;
    private boolean published;
    private Instant publishAt;
    private Instant expiresAt;
    private boolean isBookmarked;
    private boolean isRead;
    private Instant createdAt;

    public AnnouncementDto() {
    }

    public static AnnouncementDto fromEntity(Announcement a, boolean isBookmarked, boolean isRead) {
        if (a == null) return null;
        AnnouncementDto dto = new AnnouncementDto();
        dto.id = a.getId();
        dto.title = a.getTitle();
        dto.body = a.getBody();
        dto.category = a.getCategory();
        if (a.getAuthor() != null) {
            dto.authorId = a.getAuthor().getId();
            dto.authorName = a.getAuthor().getFullName();
        }
        dto.targetRole = a.getTargetRole();
        if (a.getDepartment() != null) {
            dto.departmentId = a.getDepartment().getId();
            dto.departmentName = a.getDepartment().getName();
        }
        dto.pinned = a.isPinned();
        dto.published = a.isPublished();
        dto.publishAt = a.getPublishAt();
        dto.expiresAt = a.getExpiresAt();
        dto.isBookmarked = isBookmarked;
        dto.isRead = isRead;
        dto.createdAt = a.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getBody() {
        return body;
    }

    public String getCategory() {
        return category;
    }

    public Long getAuthorId() {
        return authorId;
    }

    public String getAuthorName() {
        return authorName;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public boolean isPinned() {
        return pinned;
    }

    public boolean isPublished() {
        return published;
    }

    public Instant getPublishAt() {
        return publishAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isBookmarked() {
        return isBookmarked;
    }

    public boolean isRead() {
        return isRead;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
