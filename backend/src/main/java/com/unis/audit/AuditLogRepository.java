package com.unis.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a LEFT JOIN FETCH a.actor WHERE " +
           "(:action IS NULL OR a.action = :action) AND " +
           "(:resource IS NULL OR a.targetResource = :resource) " +
           "ORDER BY a.createdAt DESC")
    Page<AuditLog> searchLogs(@Param("action") String action,
                              @Param("resource") String resource,
                              Pageable pageable);
}
