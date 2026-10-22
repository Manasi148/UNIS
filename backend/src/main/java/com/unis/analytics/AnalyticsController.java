package com.unis.analytics;

import com.unis.common.ApiResponse;
import com.unis.security.CustomUserDetails;
import com.unis.user.User;
import com.unis.user.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

    private final AnalyticsService analyticsService;
    private final UserService userService;

    public AnalyticsController(AnalyticsService analyticsService, UserService userService) {
        this.analyticsService = analyticsService;
        this.userService = userService;
    }

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsDto.OverviewStats>> getOverviewStats(
            @AuthenticationPrincipal CustomUserDetails authUser) {
        User user = userService.getUserEntity(authUser.getId());
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getOverviewStats(user)));
    }

    @GetMapping({"/tickets-by-category", "/categories"})
    public ResponseEntity<ApiResponse<List<AnalyticsDto.ChartDataPoint>>> getTicketsByCategory() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTicketsByCategory()));
    }

    @GetMapping({"/tickets-by-department", "/departments"})
    public ResponseEntity<ApiResponse<List<AnalyticsDto.ChartDataPoint>>> getTicketsByDepartment() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getTicketsByDepartment()));
    }

    @GetMapping("/monthly-trends")
    public ResponseEntity<ApiResponse<List<AnalyticsDto.ChartDataPoint>>> getMonthlyTrends() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getMonthlyTrends()));
    }

    @GetMapping("/workload")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_HEAD')")
    public ResponseEntity<ApiResponse<List<AnalyticsDto.StaffWorkload>>> getStaffWorkload() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getStaffWorkload()));
    }

    @GetMapping("/hotspots")
    @PreAuthorize("hasAnyRole('ADMIN', 'DEPARTMENT_HEAD', 'STAFF')")
    public ResponseEntity<ApiResponse<List<AnalyticsDto.HotspotDto>>> getCampusHotspots() {
        return ResponseEntity.ok(ApiResponse.success(analyticsService.getCampusHotspots()));
    }
}
