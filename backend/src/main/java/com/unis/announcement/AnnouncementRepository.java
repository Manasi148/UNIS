package com.unis.announcement;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AnnouncementRepository extends JpaRepository<Announcement, Long> {

    @Query("SELECT a FROM Announcement a " +
           "LEFT JOIN FETCH a.author " +
           "LEFT JOIN FETCH a.department " +
           "WHERE a.published = true " +
           "AND (a.targetRole IN :targetRoles) " +
           "AND (:category IS NULL OR a.category = :category) " +
           "AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(a.body) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.pinned DESC, a.publishAt DESC")
    Page<Announcement> findTargetedAnnouncements(
            @Param("targetRoles") List<String> targetRoles,
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT a FROM Announcement a " +
           "LEFT JOIN FETCH a.author " +
           "LEFT JOIN FETCH a.department " +
           "WHERE (:category IS NULL OR a.category = :category) " +
           "AND (:search IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY a.pinned DESC, a.createdAt DESC")
    Page<Announcement> findAllForAdmin(
            @Param("category") String category,
            @Param("search") String search,
            Pageable pageable
    );
}
