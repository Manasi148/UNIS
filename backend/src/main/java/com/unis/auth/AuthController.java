package com.unis.auth;

import com.unis.audit.AuditService;
import com.unis.common.ApiResponse;
import com.unis.common.BadRequestException;
import com.unis.department.Department;
import com.unis.department.DepartmentRepository;
import com.unis.security.CustomUserDetails;
import com.unis.user.ApprovalStatus;
import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserDto;
import com.unis.user.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    /**
     * Generic authentication failure message. This message must not reveal
     * whether the account exists, what role it has, or why the specific
     * failure occurred. It is used for ALL authentication failures including:
     * wrong password, unknown account, deactivated account, rejected account,
     * and role-mode mismatch.
     */
    static final String GENERIC_AUTH_ERROR =
            "Unable to sign in with the provided credentials. Check your details and try again.";

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          DepartmentRepository departmentRepository,
                          PasswordEncoder passwordEncoder,
                          AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    @PostMapping("/login")
    @Transactional
    public ResponseEntity<ApiResponse<UserDto>> login(@Valid @RequestBody LoginRequest request,
                                                      HttpServletRequest httpRequest) {
        // Step 1: Determine the login mode from the request (STUDENT or ADMIN).
        // Normalize defensively. We do NOT trust any role value from the client.
        final String loginMode = (request.getLoginMode() != null
                ? request.getLoginMode().trim().toUpperCase()
                : "STUDENT");
        final boolean adminModeRequested = "ADMIN".equals(loginMode);

        // Step 2: Authenticate credentials against the database.
        // authenticationManager.authenticate() may set the SecurityContextHolder
        // internally. We clear it immediately after so we control exactly when
        // (and whether) an authenticated context is established.
        Authentication auth;
        try {
            auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getIdentifier().trim(), request.getPassword())
            );
        } catch (Exception ex) {
            // Credential validation failed. Clear any partial security state
            // and return the generic error – do NOT reveal why it failed.
            SecurityContextHolder.clearContext();
            invalidateExistingSession(httpRequest);
            log.warn("[AUTH] Credential validation failed for identifier={} mode={}: {}",
                    request.getIdentifier(), loginMode, ex.getClass().getSimpleName());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(GENERIC_AUTH_ERROR));
        }

        // Step 3: Clear whatever Spring Security may have set internally during
        // authenticate(). We establish the context ourselves only AFTER all
        // checks pass.
        SecurityContextHolder.clearContext();

        // Step 4: Load the full user record from the database.
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        User user = userRepository.findById(userDetails.getId())
                .orElse(null);
        if (user == null) {
            invalidateExistingSession(httpRequest);
            log.warn("[AUTH] User principal found in auth but missing from DB id={}", userDetails.getId());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(GENERIC_AUTH_ERROR));
        }

        // Step 5: Check account activation state.
        if (!user.isActive()) {
            invalidateExistingSession(httpRequest);
            log.warn("[AUTH] Login attempt on deactivated account id={} email={}", user.getId(), user.getEmail());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(GENERIC_AUTH_ERROR));
        }

        // Step 6: Check approval state (rejected registrations cannot sign in).
        if (user.getApprovalStatus() == ApprovalStatus.REJECTED) {
            invalidateExistingSession(httpRequest);
            log.warn("[AUTH] Login attempt on rejected account id={}", user.getId());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(GENERIC_AUTH_ERROR));
        }

        // Step 7: *** CRITICAL ROLE-MODE ENFORCEMENT ***
        // Validate that the account's actual stored role is permitted for the
        // requested login mode. This check happens BEFORE any session or
        // security context is established.
        //
        // Admin mode: only ADMIN accounts may proceed.
        // Student mode: only STUDENT and DEPARTMENT_HEAD accounts may proceed.
        // An ADMIN must never authenticate through the student login flow and
        // vice versa. We return the same generic error regardless of which
        // direction the mismatch occurred, so the response does not reveal the
        // account's role.
        boolean roleMismatch;
        if (adminModeRequested) {
            roleMismatch = (user.getRole() != Role.ADMIN);
        } else {
            // Student portal: permit STUDENT and DEPARTMENT_HEAD; block ADMIN
            roleMismatch = (user.getRole() == Role.ADMIN);
        }

        if (roleMismatch) {
            // Do NOT establish any session or security context.
            // Invalidate any existing session (e.g. from a prior login of the
            // same browser) so it cannot be silently reused.
            invalidateExistingSession(httpRequest);
            log.warn("[AUTH] Login mode mismatch: accountRole={} requestedMode={} id={} – returning generic error",
                    user.getRole(), loginMode, user.getId());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error(GENERIC_AUTH_ERROR));
        }

        // Step 8: All checks passed. Now establish the authenticated session.
        SecurityContext securityContext = SecurityContextHolder.createEmptyContext();
        securityContext.setAuthentication(auth);
        SecurityContextHolder.setContext(securityContext);

        HttpSession session = httpRequest.getSession(true);
        session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);

        auditService.log(user, "LOGIN", "AUTH", user.getId(),
                "User logged in successfully (" + loginMode + " mode)", httpRequest.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Login successful", UserDto.fromEntity(user)));
    }

    /**
     * Invalidates the current HTTP session if one exists. This ensures that a
     * failed authentication attempt (including role-mode mismatch) does not
     * leave a previously authenticated principal accessible via the old session.
     */
    private void invalidateExistingSession(HttpServletRequest httpRequest) {
        try {
            HttpSession existingSession = httpRequest.getSession(false);
            if (existingSession != null) {
                existingSession.invalidate();
            }
        } catch (IllegalStateException ignored) {
            // Session was already invalidated – nothing to do.
        }
    }

    @PostMapping("/register")
    @Transactional
    public ResponseEntity<ApiResponse<UserDto>> register(@Valid @RequestBody RegisterRequest request,
                                                         HttpServletRequest httpRequest) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Passwords do not match. Please verify both password entries.");
        }

        com.unis.common.PasswordValidator.validate(request.getPassword());

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("An institutional account with this email already exists");
        }

        String derivedUsername = email.split("@")[0].replaceAll("[^a-zA-Z0-9._-]", "");
        if (userRepository.existsByUsername(derivedUsername)) {
            derivedUsername = derivedUsername + "_" + (System.currentTimeMillis() % 10000);
        }

        // Reject attempts to inject custom department names
        if (request.getDepartmentRequested() != null && !request.getDepartmentRequested().trim().isEmpty()) {
            throw new BadRequestException("Custom department registration is not permitted. Please select an approved department.");
        }

        String deptSelection = request.getDepartment() != null ? request.getDepartment().trim() : "";
        if (deptSelection.isEmpty() || "Other".equalsIgnoreCase(deptSelection)) {
            throw new BadRequestException("Please select an approved academic department.");
        }

        // Validate department exists and is active. Supports ID (e.g. "7"), name, or code.
        Department resolvedDepartment = null;
        if (deptSelection.matches("^\\d+$")) {
            Long deptId = Long.parseLong(deptSelection);
            resolvedDepartment = departmentRepository.findById(deptId).orElse(null);
        } else {
            resolvedDepartment = departmentRepository.findByNameIgnoreCase(deptSelection)
                    .or(() -> departmentRepository.findByCodeIgnoreCase(deptSelection))
                    .orElse(null);
        }

        if (resolvedDepartment == null) {
            throw new BadRequestException("Invalid academic department: '" + deptSelection + "'. Department does not exist.");
        }

        if (!resolvedDepartment.isActive()) {
            throw new BadRequestException("The selected department is inactive and not accepting new student registrations.");
        }

        User user = new User();
        user.setUsername(derivedUsername);
        user.setEmail(email);
        if (request.getInstitutionalEmail() != null && !request.getInstitutionalEmail().trim().isEmpty()) {
            user.setInstitutionalEmail(request.getInstitutionalEmail().trim().toLowerCase());
        }
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName().trim());
        user.setStudentOrStaffId(request.getStudentId() != null && !request.getStudentId().trim().isEmpty() ? request.getStudentId().trim() : null);
        user.setPhone(request.getPhone());
        user.setRole(Role.STUDENT); // Server strictly assigns STUDENT
        user.setApprovalStatus(ApprovalStatus.PENDING); // Strictly starts PENDING
        user.setDepartment(resolvedDepartment);
        user.setDepartmentRequested(null);
        user.setActive(true);

        User saved = userRepository.save(user);

        auditService.log(saved, "REGISTER", "AUTH", saved.getId(), "Student registered account with status PENDING", httpRequest.getRemoteAddr());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Registration submitted successfully! Your account is pending departmental approval before full access is granted.", UserDto.fromEntity(saved)));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest httpRequest) {
        HttpSession session = httpRequest.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logged out successfully", null));
    }

    @GetMapping("/me")
    @Transactional(readOnly = true)
    public ResponseEntity<ApiResponse<UserDto>> getCurrentUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(ApiResponse.error("Not authenticated"));
        }

        User user = userRepository.findById(userDetails.getId())
                .orElseThrow(() -> new BadRequestException("User profile not found"));

        return ResponseEntity.ok(ApiResponse.success(UserDto.fromEntity(user)));
    }

    @PostMapping("/dev-reset-password")
    @Transactional
    public ResponseEntity<ApiResponse<Void>> devResetPassword(@Valid @RequestBody ResetPasswordRequest request,
                                                              HttpServletRequest httpRequest) {
        com.unis.common.PasswordValidator.validate(request.getNewPassword());

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new BadRequestException("No account registered with email: " + request.getEmail()));

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditService.log(user, "PASSWORD_RESET_DEV", "AUTH", user.getId(), "Password reset via dev recovery", httpRequest.getRemoteAddr());

        return ResponseEntity.ok(ApiResponse.success("Password has been reset successfully. You can now log in.", null));
    }
}
