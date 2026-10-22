package com.unis.user;

import com.unis.common.ForbiddenException;
import com.unis.department.Department;
import com.unis.department.DepartmentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class StudentApprovalWorkflowTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    private Department compDept;
    private Department itDept;
    private User admin;
    private User compHead;
    private User itHead;
    private User compStudent;
    private User itStudent;

    @BeforeEach
    void setUp() {
        compDept = departmentRepository.findByCode("COMP")
                .orElseGet(() -> departmentRepository.save(new Department(null, "Computer Engineering", "COMP", "Desc", "comp@unis.edu", true)));

        itDept = departmentRepository.findByCode("IT")
                .orElseGet(() -> departmentRepository.save(new Department(null, "Information Technology", "IT", "Desc", "it@unis.edu", true)));

        admin = userRepository.findByEmail("admin@unis.edu").orElseGet(() -> {
            User u = new User();
            u.setUsername("admin_test");
            u.setEmail("admin_test@unis.edu");
            u.setPasswordHash("hash");
            u.setFullName("Admin Tester");
            u.setRole(Role.ADMIN);
            u.setApprovalStatus(ApprovalStatus.APPROVED);
            return userRepository.save(u);
        });

        compHead = new User();
        compHead.setUsername("comp_head_test");
        compHead.setEmail("comp_head_test@unis.edu");
        compHead.setPasswordHash("hash");
        compHead.setFullName("Comp HOD");
        compHead.setRole(Role.DEPARTMENT_HEAD);
        compHead.setApprovalStatus(ApprovalStatus.APPROVED);
        compHead.setDepartment(compDept);
        compHead = userRepository.save(compHead);

        itHead = new User();
        itHead.setUsername("it_head_test");
        itHead.setEmail("it_head_test@unis.edu");
        itHead.setPasswordHash("hash");
        itHead.setFullName("IT HOD");
        itHead.setRole(Role.DEPARTMENT_HEAD);
        itHead.setApprovalStatus(ApprovalStatus.APPROVED);
        itHead.setDepartment(itDept);
        itHead = userRepository.save(itHead);

        compStudent = new User();
        compStudent.setUsername("comp_student_test");
        compStudent.setEmail("comp_student_test@unis.edu");
        compStudent.setPasswordHash("hash");
        compStudent.setFullName("Comp Student");
        compStudent.setRole(Role.STUDENT);
        compStudent.setApprovalStatus(ApprovalStatus.PENDING);
        compStudent.setDepartment(compDept);
        compStudent = userRepository.save(compStudent);

        itStudent = new User();
        itStudent.setUsername("it_student_test");
        itStudent.setEmail("it_student_test@unis.edu");
        itStudent.setPasswordHash("hash");
        itStudent.setFullName("IT Student");
        itStudent.setRole(Role.STUDENT);
        itStudent.setApprovalStatus(ApprovalStatus.PENDING);
        itStudent.setDepartment(itDept);
        itStudent = userRepository.save(itStudent);
    }

    @Test
    @DisplayName("Department Head can approve a pending student in their own department")
    void testDeptHeadCanApproveOwnDeptStudent() {
        UserDto approved = userService.approveStudent(compStudent.getId(), null, compHead);
        assertEquals(ApprovalStatus.APPROVED, approved.getApprovalStatus());
        assertEquals("Comp HOD", approved.getApprovedByName());
    }

    @Test
    @DisplayName("Department Head CANNOT approve a pending student from a different department (Throws ForbiddenException)")
    void testDeptHeadCannotApproveOtherDeptStudent() {
        assertThrows(ForbiddenException.class, () -> {
            userService.approveStudent(itStudent.getId(), null, compHead);
        });
    }

    @Test
    @DisplayName("Administrator can approve pending students in ANY department")
    void testAdminCanApproveAnyDeptStudent() {
        UserDto approved = userService.approveStudent(itStudent.getId(), null, admin);
        assertEquals(ApprovalStatus.APPROVED, approved.getApprovalStatus());
    }

    @Test
    @DisplayName("Bulk approval respects department isolation for Department Heads")
    void testBulkApproveScopeEnforced() {
        BulkStudentActionRequest request = new BulkStudentActionRequest();
        request.setStudentIds(List.of(compStudent.getId(), itStudent.getId()));

        BulkActionResultDto result = userService.bulkApprove(request, compHead);
        // compStudent should succeed (1), itStudent should fail (1)
        assertEquals(1, result.getSuccessCount());
        assertEquals(1, result.getFailureCount());
    }
}
