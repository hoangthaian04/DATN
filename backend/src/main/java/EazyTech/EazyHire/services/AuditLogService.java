package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.AuditLogDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.AuditLogFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.AuditLogResponseDTO;
import org.springframework.data.domain.Page;

public interface AuditLogService {
    Page<AuditLogResponseDTO> getLogs(AuditLogFilterRequestDTO request);

    AuditLogDetailResponseDTO getLog(Long id);
}
