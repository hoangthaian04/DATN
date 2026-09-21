package EazyTech.EazyHire.services;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.models.dtos.EmailLogDTO;
import EazyTech.EazyHire.models.dtos.EmailLogRetryResponseDTO;
import EazyTech.EazyHire.models.enums.EmailLogStatus;
import org.springframework.data.domain.Page;

public interface EmailLogService {
    Page<EmailLogDTO> list(Long companyId, EmailLogStatus status, String templateCode, PaginationRequest paginationRequest);

    EmailLogDTO get(Long companyId, Long logId);

    EmailLogDTO record(Long companyId, Long applicationId, String recipientEmail, String templateCode,
                       String subject, String bodyHtml, boolean sent);

    EmailLogRetryResponseDTO retry(Long companyId, Long userId, Long logId);
}
