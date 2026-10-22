package com.unis.governance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AdminRemovalApprovalRepository extends JpaRepository<AdminRemovalApproval, Long> {
    Optional<AdminRemovalApproval> findByProposalIdAndAdminId(Long proposalId, Long adminId);
    boolean existsByProposalIdAndAdminId(Long proposalId, Long adminId);
    long countByProposalId(Long proposalId);
}
