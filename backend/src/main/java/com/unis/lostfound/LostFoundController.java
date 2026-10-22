package com.unis.lostfound;

import com.unis.common.ApiResponse;
import com.unis.common.PagedResponse;
import com.unis.security.CustomUserDetails;
import com.unis.user.User;
import com.unis.user.UserService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class LostFoundController {

    private final LostFoundService lostFoundService;
    private final LostFoundMatchingService matchingService;
    private final UserService userService;

    public LostFoundController(LostFoundService lostFoundService,
                               LostFoundMatchingService matchingService,
                               UserService userService) {
        this.lostFoundService = lostFoundService;
        this.matchingService = matchingService;
        this.userService = userService;
    }

    @PostMapping("/lost-found")
    public ResponseEntity<ApiResponse<LostFoundDto>> createItem(
            @Valid @RequestBody CreateLostFoundRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item listing created", lostFoundService.createItem(request, user)));
    }

    @GetMapping("/lost-found")
    public ResponseEntity<ApiResponse<PagedResponse<LostFoundDto>>> getItems(
            @RequestParam(required = false) String itemType,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) Long reportedById,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(
                lostFoundService.getItems(itemType, category, status, reportedById, search, pageable)));
    }

    @GetMapping("/lost-found/{id}")
    public ResponseEntity<ApiResponse<LostFoundDto>> getItemById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(lostFoundService.getItemById(id)));
    }

    @GetMapping("/lost-found/{id}/matches")
    public ResponseEntity<ApiResponse<List<LostFoundMatchingService.MatchCandidate>>> getPossibleMatches(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(matchingService.findPossibleMatches(id)));
    }

    @PostMapping("/lost-found/{id}/claims")
    public ResponseEntity<ApiResponse<ItemClaimDto>> submitClaim(
            @PathVariable Long id,
            @Valid @RequestBody CreateClaimRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User claimant = userService.getUserEntity(authUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Claim submitted successfully",
                        lostFoundService.submitClaim(id, request, claimant)));
    }

    @GetMapping("/lost-found/{id}/claims")
    public ResponseEntity<ApiResponse<List<ItemClaimDto>>> getClaimsForItem(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success(lostFoundService.getClaimsForItem(id, user)));
    }

    @GetMapping("/claims/my")
    public ResponseEntity<ApiResponse<List<ItemClaimDto>>> getMyClaims(
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success(lostFoundService.getMyClaims(user)));
    }

    @GetMapping("/claims")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<PagedResponse<ItemClaimDto>>> getAllClaimsForReview(
            @RequestParam(required = false) String status,
            @PageableDefault(size = 15, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(ApiResponse.success(lostFoundService.getAllClaimsForReview(status, pageable)));
    }

    @PatchMapping("/claims/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'STAFF', 'DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<ItemClaimDto>> reviewClaim(
            @PathVariable Long id,
            @Valid @RequestBody ReviewClaimRequest request,
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User reviewer = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success("Claim status updated",
                lostFoundService.reviewClaim(id, request, reviewer)));
    }
}
