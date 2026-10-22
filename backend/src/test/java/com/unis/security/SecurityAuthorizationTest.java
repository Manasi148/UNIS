package com.unis.security;

import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
public class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Test
    @DisplayName("Unauthenticated request to /api/tickets should be rejected with 401 Unauthorized")
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/tickets"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Student user cannot access administrative /api/users endpoint (403 Forbidden)")
    @WithMockUser(username = "student@unis.edu", roles = {"STUDENT"})
    void testStudentCannotAccessAdminUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Student user cannot access administrative /api/audit-logs (403 Forbidden)")
    @WithMockUser(username = "student@unis.edu", roles = {"STUDENT"})
    void testStudentCannotAccessAuditLogs() throws Exception {
        mockMvc.perform(get("/api/audit-logs"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Admin user can access /api/users (200 OK)")
    @WithMockUser(username = "admin@unis.edu", roles = {"ADMIN"})
    void testAdminCanAccessAdminUsers() throws Exception {
        mockMvc.perform(get("/api/users"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Public user can access CSRF endpoint (200 OK)")
    void testCsrfEndpointPublic() throws Exception {
        mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk());
    }
}
