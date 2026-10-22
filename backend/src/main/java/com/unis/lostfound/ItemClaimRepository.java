package com.unis.lostfound;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemClaimRepository extends JpaRepository<ItemClaim, Long> {

    @Query("SELECT c FROM ItemClaim c LEFT JOIN FETCH c.claimant LEFT JOIN FETCH c.item WHERE c.item.id = :itemId")
    List<ItemClaim> findByItemId(@Param("itemId") Long itemId);

    @Query("SELECT c FROM ItemClaim c LEFT JOIN FETCH c.claimant LEFT JOIN FETCH c.item WHERE c.claimant.id = :claimantId")
    List<ItemClaim> findByClaimantId(@Param("claimantId") Long claimantId);

    @Query("SELECT c FROM ItemClaim c LEFT JOIN FETCH c.claimant LEFT JOIN FETCH c.item WHERE " +
           "(:status IS NULL OR c.claimStatus = :status)")
    Page<ItemClaim> findAllClaims(@Param("status") String status, Pageable pageable);

    boolean existsByItemIdAndClaimantId(Long itemId, Long claimantId);
    long countByClaimStatus(String claimStatus);
    long countByItemId(Long itemId);
}
