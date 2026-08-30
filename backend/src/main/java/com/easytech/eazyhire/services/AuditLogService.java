package com.easytech.eazyhire.services;

import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.UserEntity;

public interface AuditLogService {
    void record(
            CompanyEntity company,
            UserEntity actor,
            String action,
            String targetType,
            Long targetId,
            String metadata
    );
}
