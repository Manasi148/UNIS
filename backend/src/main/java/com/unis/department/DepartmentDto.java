package com.unis.department;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DepartmentDto {
    private Long id;

    @NotBlank(message = "Department name is required")
    @Size(max = 100)
    private String name;

    @NotBlank(message = "Department code is required")
    @Size(max = 50)
    private String code;

    private String description;
    private String contactEmail;
    private boolean active = true;

    public DepartmentDto() {
    }

    public DepartmentDto(Long id, String name, String code, String description, String contactEmail, boolean active) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
        this.contactEmail = contactEmail;
        this.active = active;
    }

    public static DepartmentDto fromEntity(Department dept) {
        if (dept == null) return null;
        return new DepartmentDto(
                dept.getId(),
                dept.getName(),
                dept.getCode(),
                dept.getDescription(),
                dept.getContactEmail(),
                dept.isActive()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }
}
