package com.unis.governance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AdminRemovalProposalRepository extends JpaRepository<AdminRemovalProposal, Long> {
    List<AdminRemovalProposal> findByStatusOrderByCreatedAtDesc(String status);
    List<AdminRemovalProposal> findAllByOrderByCreatedAtDesc();
    Optional<AdminRemovalProposal> findByTargetAdminIdAndStatus(Long targetAdminId, String status);
    boolean existsByTargetAdminIdAndStatus(Long targetAdminId, String status);
}
