package com.unis.user;

public class UpdateUserRequest {
    private String fullName;
    private String phone;
    private Role role;
    private Long departmentId;
    private boolean clearDepartment;

    public UpdateUserRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
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

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public boolean isClearDepartment() {
        return clearDepartment;
    }

    public void setClearDepartment(boolean clearDepartment) {
        this.clearDepartment = clearDepartment;
    }
}
