package com.unis.lostfound;

import java.time.Instant;
import java.time.LocalDate;

public class LostFoundDto {
    private Long id;
    private String title;
    private String description;
    private String category;
    private String color;
    private String itemType;
    private String status;
    private Long locationId;
    private String locationName;
    private String locationDescription;
    private LocalDate dateOccurred;
    private String imageUrl;
    private Long reportedById;
    private String reportedByName;
    private String contactInfo;
    private Instant createdAt;
    private long claimsCount;

    public LostFoundDto() {
    }

    public static LostFoundDto fromEntity(LostFoundItem item) {
        if (item == null) return null;
        LostFoundDto dto = new LostFoundDto();
        dto.id = item.getId();
        dto.title = item.getTitle();
        dto.description = item.getDescription();
        dto.category = item.getCategory();
        dto.color = item.getColor();
        dto.itemType = item.getItemType();
        dto.status = item.getStatus();

        if (item.getLocation() != null) {
            dto.locationId = item.getLocation().getId();
            dto.locationName = item.getLocation().getName();
        }
        dto.locationDescription = item.getLocationDescription();
        dto.dateOccurred = item.getDateOccurred();
        dto.imageUrl = item.getImageUrl();

        if (item.getReportedBy() != null) {
            dto.reportedById = item.getReportedBy().getId();
            dto.reportedByName = item.getReportedBy().getFullName();
        }

        dto.contactInfo = item.getContactInfo();
        dto.createdAt = item.getCreatedAt();

        return dto;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public String getCategory() {
        return category;
    }

    public String getColor() {
        return color;
    }

    public String getItemType() {
        return itemType;
    }

    public String getStatus() {
        return status;
    }

    public Long getLocationId() {
        return locationId;
    }

    public String getLocationName() {
        return locationName;
    }

    public String getLocationDescription() {
        return locationDescription;
    }

    public LocalDate getDateOccurred() {
        return dateOccurred;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Long getReportedById() {
        return reportedById;
    }

    public String getReportedByName() {
        return reportedByName;
    }

    public String getContactInfo() {
        return contactInfo;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public long getClaimsCount() {
        return claimsCount;
    }

    public void setClaimsCount(long claimsCount) {
        this.claimsCount = claimsCount;
    }
}
