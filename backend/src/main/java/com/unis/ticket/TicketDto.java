package com.unis.ticket;

import java.time.Instant;

public class TicketDto {
    private Long id;
    private String ticketReference;
    private String title;
    private String category;
    private TicketPriority priority;
    private TicketStatus status;
    private Long createdById;
    private String createdByName;
    private String createdByEmail;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private Long locationId;
    private String locationName;
    private String building;
    private String roomNumber;
    private Long assignedToId;
    private String assignedToName;
    private Instant targetResolutionAt;
    private Instant resolvedAt;
    private boolean overdue;
    private int escalationLevel;
    private int reopenedCount;
    private Instant createdAt;
    private Instant updatedAt;

    public TicketDto() {
    }

    public static TicketDto fromEntity(Ticket ticket) {
        if (ticket == null) return null;
        TicketDto dto = new TicketDto();
        dto.id = ticket.getId();
        dto.ticketReference = ticket.getTicketReference();
        dto.title = ticket.getTitle();
        dto.category = ticket.getCategory();
        dto.priority = ticket.getPriority();
        dto.status = ticket.getStatus();

        if (ticket.getCreatedBy() != null) {
            dto.createdById = ticket.getCreatedBy().getId();
            dto.createdByName = ticket.getCreatedBy().getFullName();
            dto.createdByEmail = ticket.getCreatedBy().getEmail();
        }

        if (ticket.getDepartment() != null) {
            dto.departmentId = ticket.getDepartment().getId();
            dto.departmentName = ticket.getDepartment().getName();
            dto.departmentCode = ticket.getDepartment().getCode();
        }

        if (ticket.getLocation() != null) {
            dto.locationId = ticket.getLocation().getId();
            dto.locationName = ticket.getLocation().getName();
            dto.building = ticket.getLocation().getBuilding();
            dto.roomNumber = ticket.getLocation().getRoomNumber();
        }

        if (ticket.getAssignedTo() != null) {
            dto.assignedToId = ticket.getAssignedTo().getId();
            dto.assignedToName = ticket.getAssignedTo().getFullName();
        }

        dto.targetResolutionAt = ticket.getTargetResolutionAt();
        dto.resolvedAt = ticket.getResolvedAt();
        dto.overdue = ticket.isOverdue();
        dto.escalationLevel = ticket.getEscalationLevel();
        dto.reopenedCount = ticket.getReopenedCount();
        dto.createdAt = ticket.getCreatedAt();
        dto.updatedAt = ticket.getUpdatedAt();

        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTicketReference() { return ticketReference; }
    public void setTicketReference(String ticketReference) { this.ticketReference = ticketReference; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public TicketPriority getPriority() { return priority; }
    public void setPriority(TicketPriority priority) { this.priority = priority; }

    public TicketStatus getStatus() { return status; }
    public void setStatus(TicketStatus status) { this.status = status; }

    public Long getCreatedById() { return createdById; }
    public void setCreatedById(Long createdById) { this.createdById = createdById; }

    public String getCreatedByName() { return createdByName; }
    public void setCreatedByName(String createdByName) { this.createdByName = createdByName; }

    public String getCreatedByEmail() { return createdByEmail; }
    public void setCreatedByEmail(String createdByEmail) { this.createdByEmail = createdByEmail; }

    public Long getDepartmentId() { return departmentId; }
    public void setDepartmentId(Long departmentId) { this.departmentId = departmentId; }

    public String getDepartmentName() { return departmentName; }
    public void setDepartmentName(String departmentName) { this.departmentName = departmentName; }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public Long getLocationId() { return locationId; }
    public void setLocationId(Long locationId) { this.locationId = locationId; }

    public String getLocationName() { return locationName; }
    public void setLocationName(String locationName) { this.locationName = locationName; }

    public String getBuilding() { return building; }
    public void setBuilding(String building) { this.building = building; }

    public String getRoomNumber() { return roomNumber; }
    public void setRoomNumber(String roomNumber) { this.roomNumber = roomNumber; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }

    public String getAssignedToName() { return assignedToName; }
    public void setAssignedToName(String assignedToName) { this.assignedToName = assignedToName; }

    public Instant getTargetResolutionAt() { return targetResolutionAt; }
    public void setTargetResolutionAt(Instant targetResolutionAt) { this.targetResolutionAt = targetResolutionAt; }

    public Instant getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(Instant resolvedAt) { this.resolvedAt = resolvedAt; }

    public boolean isOverdue() { return overdue; }
    public void setOverdue(boolean overdue) { this.overdue = overdue; }

    public int getEscationLevel() { return escalationLevel; }
    public int getEscalationLevel() { return escalationLevel; }
    public void setEscalationLevel(int escalationLevel) { this.escalationLevel = escalationLevel; }

    public int getReopenedCount() { return reopenedCount; }
    public void setReopenedCount(int reopenedCount) { this.reopenedCount = reopenedCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
