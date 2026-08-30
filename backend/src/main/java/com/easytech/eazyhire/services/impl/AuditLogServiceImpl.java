package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.models.entities.AuditLogEntity;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.UserEntity;
import com.easytech.eazyhire.repositories.AuditLogRepository;
import com.easytech.eazyhire.services.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;

    @Override
    public void record(
            CompanyEntity company,
            UserEntity actor,
            String action,
            String targetType,
            Long targetId,
            String metadata
    ) {
        auditLogRepository.save(AuditLogEntity.builder()
                .company(company)
                .actorUser(actor)
                .actorRole(actor != null && actor.getRole() != null ? actor.getRole().name() : null)
                .action(action)
                .targetType(targetType)
                .targetId(targetId)
                .metadata(metadata)
                .build());
    }
}
