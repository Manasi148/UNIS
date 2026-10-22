package com.unis.audit;

import com.unis.common.PagedResponse;
import com.unis.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    @Transactional
    public void log(User actor, String action, String targetResource, Long targetId, String details, String ipAddress) {
        AuditLog auditLog = new AuditLog(actor, action, targetResource, targetId, details, ipAddress);
        auditLogRepository.save(auditLog);
    }

    @Transactional(readOnly = true)
    public PagedResponse<AuditDto> getAuditLogs(String action, String resource, Pageable pageable) {
        Page<AuditLog> page = auditLogRepository.searchLogs(action, resource, pageable);
        return PagedResponse.of(page.map(AuditDto::fromEntity));
    }
}
