package com.unis.location;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CampusLocationRepository extends JpaRepository<CampusLocation, Long> {
    List<CampusLocation> findByActiveTrue();
    List<CampusLocation> findByBuildingAndActiveTrue(String building);
}
