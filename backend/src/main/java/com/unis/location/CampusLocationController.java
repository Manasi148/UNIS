package com.unis.location;

import com.unis.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class CampusLocationController {

    private final CampusLocationService campusLocationService;

    public CampusLocationController(CampusLocationService campusLocationService) {
        this.campusLocationService = campusLocationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CampusLocationDto>>> getAllLocations(
            @RequestParam(value = "activeOnly", defaultValue = "false") boolean activeOnly) {
        return ResponseEntity.ok(ApiResponse.success(campusLocationService.getAllLocations(activeOnly)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CampusLocationDto>> getLocationById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(campusLocationService.getLocationById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CampusLocationDto>> createLocation(@Valid @RequestBody CampusLocationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Location created successfully", campusLocationService.createLocation(dto)));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CampusLocationDto>> updateLocation(
            @PathVariable Long id,
            @Valid @RequestBody CampusLocationDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully", campusLocationService.updateLocation(id, dto)));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> toggleStatus(
            @PathVariable Long id,
            @RequestParam boolean active) {
        campusLocationService.toggleActiveStatus(id, active);
        return ResponseEntity.ok(ApiResponse.success("Location status updated successfully", null));
    }
}
