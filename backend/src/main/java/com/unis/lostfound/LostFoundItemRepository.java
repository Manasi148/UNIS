package com.unis.lostfound;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LostFoundItemRepository extends JpaRepository<LostFoundItem, Long> {

    @Query("SELECT i FROM LostFoundItem i " +
           "LEFT JOIN FETCH i.reportedBy " +
           "LEFT JOIN FETCH i.location " +
           "WHERE (:itemType IS NULL OR i.itemType = :itemType) " +
           "AND (:category IS NULL OR i.category = :category) " +
           "AND (:status IS NULL OR i.status = :status) " +
           "AND (:reportedById IS NULL OR i.reportedBy.id = :reportedById) " +
           "AND (:search IS NULL OR LOWER(i.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "     OR LOWER(i.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<LostFoundItem> filterItems(
            @Param("itemType") String itemType,
            @Param("category") String category,
            @Param("status") String status,
            @Param("reportedById") Long reportedById,
            @Param("search") String search,
            Pageable pageable
    );

    List<LostFoundItem> findByItemTypeAndStatus(String itemType, String status);

    long countByItemType(String itemType);
    long countByStatus(String status);
}
