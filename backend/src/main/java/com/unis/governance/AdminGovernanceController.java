package com.unis.governance;

import com.unis.common.ApiResponse;
import com.unis.security.CustomUserDetails;
import com.unis.user.User;
import com.unis.user.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/governance")
@PreAuthorize("hasRole('ADMIN')")
public class AdminGovernanceController {

    private final AdminGovernanceService governanceService;
    private final UserService userService;

    public AdminGovernanceController(AdminGovernanceService governanceService, UserService userService) {
        this.governanceService = governanceService;
        this.userService = userService;
    }

    private User resolveActor(CustomUserDetails authUser) {
        return userService.getUserEntity(authUser.getId());
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getOverview(@AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = resolveActor(authUser);
        return ResponseEntity.ok(ApiResponse.success(governanceService.getGovernanceOverview(actor)));
    }

    @GetMapping("/proposals")
    public ResponseEntity<ApiResponse<List<AdminRemovalProposalDto>>> getProposals(@AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = resolveActor(authUser);
        return ResponseEntity.ok(ApiResponse.success(governanceService.getAllProposals(actor)));
    }

    @PostMapping("/proposals")
    public ResponseEntity<ApiResponse<AdminRemovalProposalDto>> proposeRemoval(
            @Valid @RequestBody ProposeRemovalRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = resolveActor(authUser);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Administrator removal proposal submitted",
                        governanceService.proposeRemoval(request, actor)));
    }

    @PostMapping("/proposals/{id}/approve")
    public ResponseEntity<ApiResponse<AdminRemovalProposalDto>> approveRemoval(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = resolveActor(authUser);
        return ResponseEntity.ok(ApiResponse.success("Approval recorded successfully",
                governanceService.approveRemoval(id, actor)));
    }

    @PostMapping("/proposals/{id}/cancel")
    public ResponseEntity<ApiResponse<AdminRemovalProposalDto>> cancelProposal(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = resolveActor(authUser);
        return ResponseEntity.ok(ApiResponse.success("Proposal cancelled",
                governanceService.cancelProposal(id, actor)));
    }

    @PostMapping("/founder-self-revoke")
    public ResponseEntity<ApiResponse<Void>> founderSelfRevocation(
            @Valid @RequestBody FounderSelfRevocationRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User actor = resolveActor(authUser);
        governanceService.founderSelfRevocation(request, actor);
        return ResponseEntity.ok(ApiResponse.success("Founder succession completed. Account access updated.", null));
    }
}
