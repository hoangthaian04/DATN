package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.*;
import EazyTech.EazyHire.models.enums.EmailTemplateType;
import org.springframework.data.domain.Page;

public interface EmailTemplateService {
    Page<EmailTemplateDTO> getTemplates(Long companyId, String keyword, EmailTemplateType type, boolean activeOnly, int page, int size);
    EmailTemplateDTO create(Long companyId, Long userId, EmailTemplateCreateRequestDTO request);
    EmailTemplateDTO update(Long companyId, Long userId, Long templateId, EmailTemplateUpdateRequestDTO request);
    void delete(Long companyId, Long userId, Long templateId);
    void validateRoundTemplate(Long companyId, Long templateId, EmailTemplateType expectedType);
}
