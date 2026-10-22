package com.unis.ticket;

import java.time.Instant;

public class TicketFeedbackDto {
    private Long id;
    private Long studentId;
    private String studentName;
    private int rating;
    private String comments;
    private Instant createdAt;

    public TicketFeedbackDto() {
    }

    public static TicketFeedbackDto fromEntity(TicketFeedback feedback) {
        if (feedback == null) return null;
        TicketFeedbackDto dto = new TicketFeedbackDto();
        dto.id = feedback.getId();
        if (feedback.getStudent() != null) {
            dto.studentId = feedback.getStudent().getId();
            dto.studentName = feedback.getStudent().getFullName();
        }
        dto.rating = feedback.getRating();
        dto.comments = feedback.getComments();
        dto.createdAt = feedback.getCreatedAt();
        return dto;
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public int getRating() {
        return rating;
    }

    public String getComments() {
        return comments;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
