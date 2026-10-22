package com.unis.governance;

import com.unis.common.BadRequestException;
import com.unis.user.AdminCreateUserRequest;
import com.unis.user.Role;
import com.unis.user.User;
import com.unis.user.UserRepository;
import com.unis.user.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
public class AdminGovernanceTest {

    @Autowired
    private AdminGovernanceService governanceService;

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    private User createAdmin(String email, String name, User actor) {
        AdminCreateUserRequest req = new AdminCreateUserRequest();
        req.setEmail(email);
        req.setFullName(name);
        req.setPassword("Password@123");
        req.setRole(Role.ADMIN);
        var dto = userService.adminCreateUser(req, actor);
        return userRepository.findById(dto.getId()).orElseThrow();
    }

    @Test
    @DisplayName("Founder protection: Founder administrator cannot be targeted for removal")
    void testFounderCannotBeTargeted() {
        User founder = userRepository.findByEmailIgnoreCase("admin@hotmail.com").orElseThrow();
        assertTrue(founder.isFounder());

        // Create 4 more admins so exactly 5 exist
        User a2 = createAdmin("admin2@unis.edu", "Admin Two", founder);
        User a3 = createAdmin("admin3@unis.edu", "Admin Three", founder);
        User a4 = createAdmin("admin4@unis.edu", "Admin Four", founder);
        User a5 = createAdmin("admin5@unis.edu", "Admin Five", founder);

        assertEquals(5, userRepository.countByRoleAndActiveTrue(Role.ADMIN));

        ProposeRemovalRequest propReq = new ProposeRemovalRequest();
        propReq.setTargetAdminId(founder.getId());
        propReq.setReason("Test removal attempt");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            governanceService.proposeRemoval(propReq, a2);
        });

        assertTrue(ex.getMessage().contains("Founder protection rule"));
    }

    @Test
    @DisplayName("When fewer than 5 active administrators exist, removal proposals are blocked")
    void testRemovalBlockedWhenFewerThanFiveAdmins() {
        User founder = userRepository.findByEmailIgnoreCase("admin@hotmail.com").orElseThrow();
        User a2 = createAdmin("admin2_test@unis.edu", "Admin Two", founder);

        assertEquals(2, userRepository.countByRoleAndActiveTrue(Role.ADMIN));

        ProposeRemovalRequest propReq = new ProposeRemovalRequest();
        propReq.setTargetAdminId(a2.getId());
        propReq.setReason("Early removal attempt");

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            governanceService.proposeRemoval(propReq, founder);
        });

        assertTrue(ex.getMessage().contains("require exactly 5 active administrators"));
    }

    @Test
    @DisplayName("5-Admin Limit: Creating a 6th active administrator is blocked by backend")
    void testFiveAdminLimitEnforced() {
        User founder = userRepository.findByEmailIgnoreCase("admin@hotmail.com").orElseThrow();

        // Add admins up to 5
        createAdmin("admin2_lim@unis.edu", "Admin Two", founder);
        createAdmin("admin3_lim@unis.edu", "Admin Three", founder);
        createAdmin("admin4_lim@unis.edu", "Admin Four", founder);
        createAdmin("admin5_lim@unis.edu", "Admin Five", founder);

        assertEquals(5, userRepository.countByRoleAndActiveTrue(Role.ADMIN));

        // Attempt to create 6th admin
        AdminCreateUserRequest sixthReq = new AdminCreateUserRequest();
        sixthReq.setEmail("admin6_lim@unis.edu");
        sixthReq.setFullName("Admin Six");
        sixthReq.setPassword("Password@123");
        sixthReq.setRole(Role.ADMIN);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> {
            userService.adminCreateUser(sixthReq, founder);
        });

        assertTrue(ex.getMessage().contains("Maximum limit of 5 active administrators has been reached"));
    }

    @Test
    @DisplayName("Full governance workflow: 4 of 4 non-target unanimous approval required for removal")
    void testFullRemovalWorkflow() {
        User founder = userRepository.findByEmailIgnoreCase("admin@hotmail.com").orElseThrow();

        User a2 = createAdmin("a2_flow@unis.edu", "Admin Two", founder);
        User a3 = createAdmin("a3_flow@unis.edu", "Admin Three", founder);
        User a4 = createAdmin("a4_flow@unis.edu", "Admin Four", founder);
        User a5 = createAdmin("a5_flow@unis.edu", "Admin Five (Target)", founder);

        assertEquals(5, userRepository.countByRoleAndActiveTrue(Role.ADMIN));

        // Founder proposes removal of a5 (target)
        ProposeRemovalRequest propReq = new ProposeRemovalRequest();
        propReq.setTargetAdminId(a5.getId());
        propReq.setReason("Malfeasance during system operation");

        var propDto = governanceService.proposeRemoval(propReq, founder);
        assertEquals("PENDING", propDto.getStatus());
        assertEquals(1, propDto.getCurrentApprovalsCount()); // Founder proposer counts as 1st approval

        // Target (a5) cannot approve
        assertThrows(BadRequestException.class, () -> {
            governanceService.approveRemoval(propDto.getId(), a5);
        });

        // Founder cannot duplicate approval
        assertThrows(BadRequestException.class, () -> {
            governanceService.approveRemoval(propDto.getId(), founder);
        });

        // a2 approves (2 of 4)
        var dto2 = governanceService.approveRemoval(propDto.getId(), a2);
        assertEquals("PENDING", dto2.getStatus());
        assertEquals(2, dto2.getCurrentApprovalsCount());
        assertTrue(userRepository.findById(a5.getId()).orElseThrow().isActive());

        // a3 approves (3 of 4)
        var dto3 = governanceService.approveRemoval(propDto.getId(), a3);
        assertEquals("PENDING", dto3.getStatus());
        assertEquals(3, dto3.getCurrentApprovalsCount());
        assertTrue(userRepository.findById(a5.getId()).orElseThrow().isActive());

        // a4 approves (4 of 4 - unanimous non-target approval!)
        var dto4 = governanceService.approveRemoval(propDto.getId(), a4);
        assertEquals("EXECUTED", dto4.getStatus());
        assertEquals(4, dto4.getCurrentApprovalsCount());

        // Target a5 is now deactivated
        User updatedA5 = userRepository.findById(a5.getId()).orElseThrow();
        assertFalse(updatedA5.isActive());
    }
}
