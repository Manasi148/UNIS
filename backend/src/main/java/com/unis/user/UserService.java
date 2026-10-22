package com.unis.user;

import com.unis.audit.AuditService;
import com.unis.common.BadRequestException;
import com.unis.common.ForbiddenException;
import com.unis.common.PagedResponse;
import com.unis.common.ResourceNotFoundException;
import com.unis.department.Department;
import com.unis.department.DepartmentRepository;
import com.unis.notification.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;
    private final NotificationService notificationService;

    public UserService(UserRepository userRepository,
                       DepartmentRepository departmentRepository,
                       PasswordEncoder passwordEncoder,
                       AuditService auditService,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.notificationService = notificationService;
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
        return UserDto.fromEntity(user);
    }

    @Transactional(readOnly = true)
    public java.util.Optional<User> findByEmailOrUsername(String identifier) {
        return userRepository.findByEmail(identifier).or(() -> userRepository.findByUsername(identifier));
    }

    @Transactional(readOnly = true)
    public User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> searchUsers(Role role, Long departmentId, ApprovalStatus approvalStatus, String search, Pageable pageable, User actor) {
        if (actor.getRole() == Role.DEPARTMENT_HEAD) {
            // Department Head can only view their own department
            Long forcedDeptId = actor.getDepartment() != null ? actor.getDepartment().getId() : -1L;
            Page<User> page = userRepository.searchUsers(role, forcedDeptId, approvalStatus, search, pageable);
            return PagedResponse.of(page.map(UserDto::fromEntity));
        }
        Page<User> page = userRepository.searchUsers(role, departmentId, approvalStatus, search, pageable);
        return PagedResponse.of(page.map(UserDto::fromEntity));
    }

    @Transactional(readOnly = true)
    public PagedResponse<UserDto> searchStudents(Long departmentId, ApprovalStatus approvalStatus, String search, Pageable pageable, User actor) {
        Long targetDeptId = departmentId;
        if (actor.getRole() == Role.DEPARTMENT_HEAD) {
            // Force department head scope
            targetDeptId = actor.getDepartment() != null ? actor.getDepartment().getId() : -1L;
        }

        Page<User> page = userRepository.searchStudents(targetDeptId, approvalStatus, search, pageable);
        return PagedResponse.of(page.map(UserDto::fromEntity));
    }

    @Transactional(readOnly = true)
    public List<UserDto> getPendingStudents(User actor) {
        List<User> list;
        if (actor.getRole() == Role.DEPARTMENT_HEAD) {
            Long deptId = actor.getDepartment() != null ? actor.getDepartment().getId() : -1L;
            String deptName = actor.getDepartment() != null ? actor.getDepartment().getName() : "";
            list = userRepository.findPendingStudentsForDepartment(deptId, deptName);
        } else {
            // Admin sees all pending
            list = userRepository.findByApprovalStatus(ApprovalStatus.PENDING);
        }
        return list.stream().map(UserDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public UserDto approveStudent(Long studentId, Long assignedDepartmentId, User actor) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new BadRequestException("Can only approve STUDENT accounts.");
        }

        verifyDepartmentHeadScope(student, actor, "approve");

        // If department was Other and admin provided an assignedDepartmentId, associate it
        if (assignedDepartmentId != null) {
            Department dept = departmentRepository.findById(assignedDepartmentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + assignedDepartmentId));
            student.setDepartment(dept);
        } else if (student.getDepartment() == null && actor.getRole() == Role.DEPARTMENT_HEAD && actor.getDepartment() != null) {
            // If department head approved a requested department matching theirs, bind it
            student.setDepartment(actor.getDepartment());
        }

        student.setApprovalStatus(ApprovalStatus.APPROVED);
        student.setApprovedBy(actor);
        student.setApprovedAt(Instant.now());
        student.setActive(true);

        User saved = userRepository.save(student);

        auditService.log(actor, "APPROVE_STUDENT", "USER", saved.getId(),
                "Approved student " + saved.getEmail() + " for department " + (saved.getDepartment() != null ? saved.getDepartment().getName() : "None"), null);

        notificationService.createNotification(saved, "ACCOUNT_APPROVED", "Account Approved!",
                "Your UNIS student account has been approved by institutional administration. You now have full access to campus services.",
                "USER", saved.getId());

        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto rejectStudent(Long studentId, String reason, User actor) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new BadRequestException("Can only reject STUDENT accounts.");
        }

        verifyDepartmentHeadScope(student, actor, "reject");

        student.setApprovalStatus(ApprovalStatus.REJECTED);
        student.setActive(false);
        User saved = userRepository.save(student);

        auditService.log(actor, "REJECT_STUDENT", "USER", saved.getId(),
                "Rejected student " + saved.getEmail() + (reason != null ? ". Reason: " + reason : ""), null);

        return UserDto.fromEntity(saved);
    }

    @Transactional
    public BulkActionResultDto bulkApprove(BulkStudentActionRequest request, User actor) {
        int successCount = 0;
        int failureCount = 0;
        List<String> details = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long studentId : request.getStudentIds()) {
            try {
                approveStudent(studentId, request.getAssignedDepartmentId(), actor);
                successCount++;
                details.add("Approved student ID " + studentId);
            } catch (Exception ex) {
                failureCount++;
                errors.add("Student ID " + studentId + ": " + ex.getMessage());
            }
        }

        auditService.log(actor, "BULK_APPROVE_STUDENTS", "USER", null,
                "Bulk approval completed: " + successCount + " approved, " + failureCount + " failed", null);

        return new BulkActionResultDto(successCount, failureCount, details, errors);
    }

    @Transactional
    public BulkActionResultDto bulkReject(BulkStudentActionRequest request, User actor) {
        int successCount = 0;
        int failureCount = 0;
        List<String> details = new ArrayList<>();
        List<String> errors = new ArrayList<>();

        for (Long studentId : request.getStudentIds()) {
            try {
                rejectStudent(studentId, request.getReason(), actor);
                successCount++;
                details.add("Rejected student ID " + studentId);
            } catch (Exception ex) {
                failureCount++;
                errors.add("Student ID " + studentId + ": " + ex.getMessage());
            }
        }

        auditService.log(actor, "BULK_REJECT_STUDENTS", "USER", null,
                "Bulk rejection completed: " + successCount + " rejected, " + failureCount + " failed", null);

        return new BulkActionResultDto(successCount, failureCount, details, errors);
    }

    @Transactional
    public void removeOrDeactivateStudent(Long studentId, User actor) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));

        if (student.getRole() != Role.STUDENT) {
            throw new BadRequestException("Can only remove STUDENT accounts through this endpoint.");
        }

        verifyDepartmentHeadScope(student, actor, "remove");

        // Always safely deactivate rather than blind cascading deletion
        student.setActive(false);
        student.setApprovalStatus(ApprovalStatus.REJECTED);
        userRepository.save(student);

        auditService.log(actor, "DEACTIVATE_STUDENT", "USER", student.getId(),
                "Deactivated/removed student account " + student.getEmail(), null);
    }

    @Transactional
    public UserDto adminCreateUser(AdminCreateUserRequest request, User adminActor) {
        if (adminActor.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only institutional administrators can create accounts.");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("User with email '" + email + "' already exists");
        }

        String derivedUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        if (userRepository.existsByUsername(derivedUsername)) {
            derivedUsername = derivedUsername + "_" + (System.currentTimeMillis() % 10000);
        }

        if (request.getRole() == Role.ADMIN) {
            long activeAdmins = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
            if (activeAdmins >= 5) {
                throw new BadRequestException("Maximum limit of 5 active administrators has been reached. Cannot create additional administrator accounts.");
            }
        }

        com.unis.common.PasswordValidator.validate(request.getPassword());

        Department dept = null;
        if (request.getDepartmentId() != null) {
            dept = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with ID: " + request.getDepartmentId()));
        }

        if (request.getRole() == Role.DEPARTMENT_HEAD && dept == null) {
            throw new BadRequestException("Department heads must be assigned to an institutional department.");
        }

        User user = new User();
        user.setUsername(derivedUsername);
        user.setEmail(email);
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setStudentOrStaffId(request.getStudentOrStaffId());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setDepartment(dept);
        user.setApprovalStatus(request.getApprovalStatus() != null ? request.getApprovalStatus() : ApprovalStatus.APPROVED);
        user.setActive(true);
        user.setCreatedBy(adminActor);

        User saved = userRepository.save(user);

        auditService.log(adminActor, "ADMIN_CREATE_USER", "USER", saved.getId(),
                "Admin created user " + saved.getEmail() + " with role " + saved.getRole(), null);

        return UserDto.fromEntity(saved);
    }

    @Transactional
    public UserDto updateUser(Long id, UpdateUserRequest request, User currentActor) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        boolean isAdmin = currentActor.getRole() == Role.ADMIN;
        boolean isSelf = currentActor.getId().equals(target.getId());

        if (!isAdmin && !isSelf) {
            throw new ForbiddenException("You cannot modify another user's profile");
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            target.setFullName(request.getFullName().trim());
        }
        if (request.getPhone() != null) {
            target.setPhone(request.getPhone().trim());
        }

        if (isAdmin) {
            if (request.getRole() != null && request.getRole() != target.getRole()) {
                if (target.getRole() == Role.ADMIN) {
                    throw new BadRequestException("Administrator demotion is not permitted. Removal must follow the governance workflow.");
                }
                if (request.getRole() == Role.ADMIN) {
                    long activeAdmins = userRepository.countByRoleAndActiveTrue(Role.ADMIN);
                    if (activeAdmins >= 5) {
                        throw new BadRequestException("Maximum limit of 5 active administrators has been reached.");
                    }
                }
                Role oldRole = target.getRole();
                target.setRole(request.getRole());
                auditService.log(currentActor, "ROLE_CHANGE", "USER", target.getId(),
                        "Changed role of " + target.getEmail() + " from " + oldRole + " to " + target.getRole(), null);
            }

            if (request.getDepartmentId() != null) {
                Department dept = departmentRepository.findById(request.getDepartmentId())
                        .orElseThrow(() -> new ResourceNotFoundException("Department not found"));
                target.setDepartment(dept);
            } else if (request.isClearDepartment()) {
                target.setDepartment(null);
            }
        }

        return UserDto.fromEntity(userRepository.save(target));
    }

    @Transactional
    public void toggleUserStatus(Long id, boolean active, User currentActor) {
        User target = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));

        if (target.getRole() == Role.ADMIN) {
            throw new BadRequestException("Administrator accounts cannot be deactivated directly. Administrator removal must follow the formal governance proposal and approval workflow.");
        }

        target.setActive(active);
        userRepository.save(target);

        auditService.log(currentActor, active ? "ACTIVATE_USER" : "DEACTIVATE_USER",
                "USER", target.getId(), "User " + target.getEmail() + " active status set to " + active, null);
    }

    private void verifyDepartmentHeadScope(User student, User actor, String action) {
        if (actor.getRole() == Role.ADMIN) {
            return; // Admin can operate across all departments
        }

        if (actor.getRole() != Role.DEPARTMENT_HEAD) {
            throw new ForbiddenException("Only administrators and department heads can " + action + " students.");
        }

        Department actorDept = actor.getDepartment();
        if (actorDept == null) {
            throw new ForbiddenException("Department head has no department assigned.");
        }

        boolean deptMatches = student.getDepartment() != null && student.getDepartment().getId().equals(actorDept.getId());
        boolean requestedMatches = student.getDepartmentRequested() != null &&
                student.getDepartmentRequested().trim().equalsIgnoreCase(actorDept.getName().trim());

        if (!deptMatches && !requestedMatches) {
            throw new ForbiddenException("Department heads can only " + action + " students belonging to their own department (" + actorDept.getName() + ").");
        }
    }

    private long countActiveAdmins() {
        return userRepository.findByRoleAndActiveTrue(Role.ADMIN).size();
    }
}
