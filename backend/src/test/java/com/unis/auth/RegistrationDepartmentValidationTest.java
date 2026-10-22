package com.unis.auth;

import com.unis.common.ApiResponse;
import com.unis.common.BadRequestException;
import com.unis.department.Department;
import com.unis.department.DepartmentRepository;
import com.unis.user.ApprovalStatus;
import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserDto;
import com.unis.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Verifies backend academic department validation during student registration:
 * 1. Valid existing department succeeds and associates student with active Department entity
 * 2. Nonexistent department ID is rejected
 * 3. Arbitrary department name is rejected
 * 4. Valid department with injected custom name (departmentRequested) is rejected
 * 5. Missing / empty department is rejected
 * 6. Deactivated department is rejected
 */
@SpringBootTest
@Transactional
public class RegistrationDepartmentValidationTest {

    @Autowired
    private AuthController authController;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    private RegisterRequest createValidRequest(String email, String department) {
        RegisterRequest req = new RegisterRequest();
        req.setFullName("Test Student");
        req.setEmail(email);
        req.setDepartment(department);
        req.setPassword("Password@123");
        req.setConfirmPassword("Password@123");
        return req;
    }

    @Test
    @DisplayName("1. Valid existing department succeeds and associates student")
    void testValidDepartmentSucceeds() {
        RegisterRequest req = createValidRequest("valid.dept@unis.edu", "Computer Engineering");
        ResponseEntity<ApiResponse<UserDto>> response =
                authController.register(req, new MockHttpServletRequest());

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());

        User user = userRepository.findByEmailIgnoreCase("valid.dept@unis.edu").orElseThrow();
        assertEquals(Role.STUDENT, user.getRole());
        assertEquals(ApprovalStatus.PENDING, user.getApprovalStatus());
        assertNotNull(user.getDepartment());
        assertEquals("Computer Engineering", user.getDepartment().getName());
        assertNull(user.getDepartmentRequested());
    }

    @Test
    @DisplayName("2. Nonexistent department ID is rejected")
    void testNonexistentDepartmentIdRejected() {
        RegisterRequest req = createValidRequest("nonexistent.id@unis.edu", "99999");
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authController.register(req, new MockHttpServletRequest()));
        assertTrue(ex.getMessage().contains("Invalid academic department"));
    }

    @Test
    @DisplayName("3. Arbitrary department name is rejected")
    void testArbitraryDepartmentNameRejected() {
        RegisterRequest req = createValidRequest("arbitrary.dept@unis.edu", "Space Aeronautics");
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authController.register(req, new MockHttpServletRequest()));
        assertTrue(ex.getMessage().contains("Invalid academic department"));
    }

    @Test
    @DisplayName("4. Valid department with injected custom name is rejected")
    void testInjectedCustomNameRejected() {
        RegisterRequest req = createValidRequest("injected.name@unis.edu", "Computer Engineering");
        req.setDepartmentRequested("Hacked Department Name");
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authController.register(req, new MockHttpServletRequest()));
        assertTrue(ex.getMessage().contains("Custom department registration is not permitted"));
    }

    @Test
    @DisplayName("5. Missing department is rejected")
    void testMissingDepartmentRejected() {
        RegisterRequest req = createValidRequest("missing.dept@unis.edu", "");
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authController.register(req, new MockHttpServletRequest()));
        assertTrue(ex.getMessage().contains("Please select an approved academic department"));
    }

    @Test
    @DisplayName("6. Deactivated department is rejected")
    void testDeactivatedDepartmentRejected() {
        Department dept = new Department();
        dept.setName("Deactivated Engineering");
        dept.setCode("DEACT");
        dept.setActive(false);
        Department savedDept = departmentRepository.save(dept);

        RegisterRequest req = createValidRequest("deactivated.dept@unis.edu", savedDept.getName());
        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                authController.register(req, new MockHttpServletRequest()));
        assertTrue(ex.getMessage().contains("inactive"));
    }
}
