package com.unis.location;

import com.unis.common.ResourceNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CampusLocationService {

    private final CampusLocationRepository campusLocationRepository;

    public CampusLocationService(CampusLocationRepository campusLocationRepository) {
        this.campusLocationRepository = campusLocationRepository;
    }

    @Transactional(readOnly = true)
    public List<CampusLocationDto> getAllLocations(boolean activeOnly) {
        List<CampusLocation> list = activeOnly ? campusLocationRepository.findByActiveTrue() : campusLocationRepository.findAll();
        return list.stream().map(CampusLocationDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CampusLocationDto getLocationById(Long id) {
        CampusLocation loc = campusLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus location not found with ID: " + id));
        return CampusLocationDto.fromEntity(loc);
    }

    @Transactional
    public CampusLocationDto createLocation(CampusLocationDto dto) {
        CampusLocation loc = new CampusLocation();
        loc.setBuilding(dto.getBuilding().trim());
        loc.setFloor(dto.getFloor().trim());
        loc.setRoomNumber(dto.getRoomNumber().trim());
        loc.setName(dto.getName().trim());
        loc.setDescription(dto.getDescription());
        loc.setActive(dto.isActive());
        return CampusLocationDto.fromEntity(campusLocationRepository.save(loc));
    }

    @Transactional
    public CampusLocationDto updateLocation(Long id, CampusLocationDto dto) {
        CampusLocation loc = campusLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus location not found with ID: " + id));
        loc.setBuilding(dto.getBuilding().trim());
        loc.setFloor(dto.getFloor().trim());
        loc.setRoomNumber(dto.getRoomNumber().trim());
        loc.setName(dto.getName().trim());
        loc.setDescription(dto.getDescription());
        loc.setActive(dto.isActive());
        return CampusLocationDto.fromEntity(campusLocationRepository.save(loc));
    }

    @Transactional
    public void toggleActiveStatus(Long id, boolean active) {
        CampusLocation loc = campusLocationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campus location not found with ID: " + id));
        loc.setActive(active);
        campusLocationRepository.save(loc);
    }
}
