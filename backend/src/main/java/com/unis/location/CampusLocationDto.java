package com.unis.location;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CampusLocationDto {
    private Long id;

    @NotBlank(message = "Building name is required")
    @Size(max = 100)
    private String building;

    @NotBlank(message = "Floor is required")
    @Size(max = 50)
    private String floor;

    @NotBlank(message = "Room number is required")
    @Size(max = 50)
    private String roomNumber;

    @NotBlank(message = "Location name is required")
    @Size(max = 150)
    private String name;

    private String description;
    private boolean active = true;

    public CampusLocationDto() {
    }

    public CampusLocationDto(Long id, String building, String floor, String roomNumber, String name, String description, boolean active) {
        this.id = id;
        this.building = building;
        this.floor = floor;
        this.roomNumber = roomNumber;
        this.name = name;
        this.description = description;
        this.active = active;
    }

    public static CampusLocationDto fromEntity(CampusLocation loc) {
        if (loc == null) return null;
        return new CampusLocationDto(
                loc.getId(),
                loc.getBuilding(),
                loc.getFloor(),
                loc.getRoomNumber(),
                loc.getName(),
                loc.getDescription(),
                loc.isActive()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getBuilding() {
        return building;
    }

    public void setBuilding(String building) {
        this.building = building;
    }

    public String getFloor() {
        return floor;
    }

    public void setFloor(String floor) {
        this.floor = floor;
    }

    public String getRoomNumber() {
        return roomNumber;
    }

    public void setRoomNumber(String roomNumber) {
        this.roomNumber = roomNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
