package com.easytech.eazyhire.repositories;

import com.easytech.eazyhire.models.entities.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long> {
}
