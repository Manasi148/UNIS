package com.unis.ticket;

import java.time.Instant;
import java.util.List;

public class TicketDetailDto extends TicketDto {
    private String description;
    private String attachmentUrl;
    private String reopenReason;
    private String resolutionSummary;
    private List<TicketCommentDto> comments;
    private List<TicketHistoryDto> history;
    private TicketFeedbackDto feedback;
    private boolean isFollowedByCurrentUser;

    public TicketDetailDto() {
    }

    public static TicketDetailDto fromEntity(Ticket ticket,
                                             List<TicketCommentDto> comments,
                                             List<TicketHistoryDto> history,
                                             TicketFeedbackDto feedback,
                                             boolean isFollowed) {
        if (ticket == null) return null;
        TicketDto base = TicketDto.fromEntity(ticket);
        TicketDetailDto dto = new TicketDetailDto();

        // Copy base fields
        dto.setId(base.getId());
        dto.setTicketReference(base.getTicketReference());
        dto.setTitle(base.getTitle());
        dto.setCategory(base.getCategory());
        dto.setPriority(base.getPriority());
        dto.setStatus(base.getStatus());
        dto.setCreatedById(base.getCreatedById());
        dto.setCreatedByName(base.getCreatedByName());
        dto.setCreatedByEmail(base.getCreatedByEmail());
        dto.setDepartmentId(base.getDepartmentId());
        dto.setDepartmentName(base.getDepartmentName());
        dto.setDepartmentCode(base.getDepartmentCode());
        dto.setLocationId(base.getLocationId());
        dto.setLocationName(base.getLocationName());
        dto.setBuilding(base.getBuilding());
        dto.setRoomNumber(base.getRoomNumber());
        dto.setAssignedToId(base.getAssignedToId());
        dto.setAssignedToName(base.getAssignedToName());
        dto.setTargetResolutionAt(base.getTargetResolutionAt());
        dto.setResolvedAt(base.getResolvedAt());
        dto.setOverdue(base.isOverdue());
        dto.setEscalationLevel(base.getEscalationLevel());
        dto.setReopenedCount(base.getReopenedCount());
        dto.setCreatedAt(base.getCreatedAt());
        dto.setUpdatedAt(base.getUpdatedAt());

        // Detailed fields
        dto.description = ticket.getDescription();
        dto.attachmentUrl = ticket.getAttachmentUrl();
        dto.reopenReason = ticket.getReopenReason();
        dto.resolutionSummary = ticket.getResolutionSummary();
        dto.comments = comments;
        dto.history = history;
        dto.feedback = feedback;
        dto.isFollowedByCurrentUser = isFollowed;

        return dto;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getAttachmentUrl() {
        return attachmentUrl;
    }

    public void setAttachmentUrl(String attachmentUrl) {
        this.attachmentUrl = attachmentUrl;
    }

    public String getReopenReason() {
        return reopenReason;
    }

    public void setReopenReason(String reopenReason) {
        this.reopenReason = reopenReason;
    }

    public String getResolutionSummary() {
        return resolutionSummary;
    }

    public void setResolutionSummary(String resolutionSummary) {
        this.resolutionSummary = resolutionSummary;
    }

    public List<TicketCommentDto> getComments() {
        return comments;
    }

    public void setComments(List<TicketCommentDto> comments) {
        this.comments = comments;
    }

    public List<TicketHistoryDto> getHistory() {
        return history;
    }

    public void setHistory(List<TicketHistoryDto> history) {
        this.history = history;
    }

    public TicketFeedbackDto getFeedback() {
        return feedback;
    }

    public void setFeedback(TicketFeedbackDto feedback) {
        this.feedback = feedback;
    }

    public boolean isFollowedByCurrentUser() {
        return isFollowedByCurrentUser;
    }

    public void setFollowedByCurrentUser(boolean followedByCurrentUser) {
        isFollowedByCurrentUser = followedByCurrentUser;
    }
}
