package com.unis.user;

import java.time.Instant;

public class UserDto {
    private Long id;
    private String username;
    private String email;
    private String institutionalEmail;
    private String fullName;
    private String studentOrStaffId;
    private String phone;
    private Role role;
    private ApprovalStatus approvalStatus;
    private Long departmentId;
    private String departmentName;
    private String departmentCode;
    private String departmentRequested;
    private String approvedByName;
    private Instant approvedAt;
    private boolean active;
    private boolean founder;
    private Long createdById;
    private String createdByName;
    private Instant createdAt;

    public UserDto() {
    }

    public UserDto(Long id, String username, String email, String institutionalEmail, String fullName, String studentOrStaffId, String phone,
                   Role role, ApprovalStatus approvalStatus, Long departmentId, String departmentName, String departmentCode,
                   String departmentRequested, String approvedByName, Instant approvedAt, boolean active, Instant createdAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.institutionalEmail = institutionalEmail;
        this.fullName = fullName;
        this.studentOrStaffId = studentOrStaffId;
        this.phone = phone;
        this.role = role;
        this.approvalStatus = approvalStatus;
        this.departmentId = departmentId;
        this.departmentName = departmentName;
        this.departmentCode = departmentCode;
        this.departmentRequested = departmentRequested;
        this.approvedByName = approvedByName;
        this.approvedAt = approvedAt;
        this.active = active;
        this.createdAt = createdAt;
    }

    public static UserDto fromEntity(User user) {
        if (user == null) return null;
        Long deptId = user.getDepartment() != null ? user.getDepartment().getId() : null;
        String deptName = user.getDepartment() != null ? user.getDepartment().getName() : null;
        String deptCode = user.getDepartment() != null ? user.getDepartment().getCode() : null;
        String approverName = user.getApprovedBy() != null ? user.getApprovedBy().getFullName() : null;

        UserDto dto = new UserDto(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getInstitutionalEmail(),
                user.getFullName(),
                user.getStudentOrStaffId(),
                user.getPhone(),
                user.getRole(),
                user.getApprovalStatus(),
                deptId,
                deptName,
                deptCode,
                user.getDepartmentRequested(),
                approverName,
                user.getApprovedAt(),
                user.isActive(),
                user.getCreatedAt()
        );
        dto.setFounder(user.isFounder());
        if (user.getCreatedBy() != null) {
            dto.setCreatedById(user.getCreatedBy().getId());
            dto.setCreatedByName(user.getCreatedBy().getFullName());
        }
        return dto;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getInstitutionalEmail() {
        return institutionalEmail;
    }

    public void setInstitutionalEmail(String institutionalEmail) {
        this.institutionalEmail = institutionalEmail;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getStudentOrStaffId() {
        return studentOrStaffId;
    }

    public void setStudentOrStaffId(String studentOrStaffId) {
        this.studentOrStaffId = studentOrStaffId;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public ApprovalStatus getApprovalStatus() {
        return approvalStatus;
    }

    public void setApprovalStatus(ApprovalStatus approvalStatus) {
        this.approvalStatus = approvalStatus;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public String getDepartmentRequested() {
        return departmentRequested;
    }

    public void setDepartmentRequested(String departmentRequested) {
        this.departmentRequested = departmentRequested;
    }

    public String getApprovedByName() {
        return approvedByName;
    }

    public void setApprovedByName(String approvedByName) {
        this.approvedByName = approvedByName;
    }

    public Instant getApprovedAt() {
        return approvedAt;
    }

    public void setApprovedAt(Instant approvedAt) {
        this.approvedAt = approvedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isFounder() {
        return founder;
    }

    public void setFounder(boolean founder) {
        this.founder = founder;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }
}
