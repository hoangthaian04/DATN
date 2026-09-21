package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.EmailLogDTO;
import EazyTech.EazyHire.models.dtos.EmailLogRetryResponseDTO;
import EazyTech.EazyHire.models.entities.EmailLogEntity;
import EazyTech.EazyHire.models.enums.EmailLogStatus;
import EazyTech.EazyHire.repositories.EmailLogRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.EmailLogService;
import EazyTech.EazyHire.services.EmailService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class EmailLogServiceImpl implements EmailLogService {
    private static final String SMTP_FAILURE = "Dịch vụ SMTP không khả dụng hoặc email không được gửi.";

    private final EmailLogRepository logs;
    private final EmailService emailService;
    private final AuditService audit;

    @Override
    @Transactional(readOnly = true)
    public Page<EmailLogDTO> list(Long companyId, EmailLogStatus status, String templateCode, PaginationRequest paginationRequest) {
        String normalizedTemplateCode = normalize(templateCode);
        return logs.findForCompany(companyId, status, normalizedTemplateCode, paginationRequest.getPageable())
                .map(this::toDto);
    }

    @Override
    @Transactional(readOnly = true)
    public EmailLogDTO get(Long companyId, Long logId) {
        return toDto(find(companyId, logId));
    }

    @Override
    @Transactional
    public EmailLogDTO record(Long companyId, Long applicationId, String recipientEmail, String templateCode,
                              String subject, String bodyHtml, boolean sent) {
        EmailLogEntity log = EmailLogEntity.builder()
                .companyId(companyId)
                .applicationId(applicationId)
                .recipientEmail(recipientEmail)
                .templateCode(templateCode)
                .subject(subject)
                .bodyHtml(bodyHtml)
                .status(sent ? EmailLogStatus.SUCCESS : EmailLogStatus.FAILED)
                .errorMessage(sent ? null : SMTP_FAILURE)
                .sentAt(sent ? LocalDateTime.now() : null)
                .attemptCount(1)
                .build();
        return toDto(logs.save(log));
    }

    @Override
    @Transactional
    public EmailLogRetryResponseDTO retry(Long companyId, Long userId, Long logId) {
        EmailLogEntity log = find(companyId, logId);
        if (log.getStatus() != EmailLogStatus.FAILED) {
            throw new CustomException(400, "Chỉ có thể gửi lại email đang ở trạng thái FAILED.");
        }

        boolean sent = emailService.sendEmail(log.getRecipientEmail(), log.getSubject(), log.getBodyHtml());
        LocalDateTime retriedAt = LocalDateTime.now();
        log.setAttemptCount(log.getAttemptCount() + 1);
        log.setRetriedAt(retriedAt);
        log.setStatus(sent ? EmailLogStatus.SUCCESS : EmailLogStatus.FAILED);
        log.setErrorMessage(sent ? null : SMTP_FAILURE);
        if (sent) log.setSentAt(retriedAt);
        logs.save(log);

        audit.recordTarget(userId, companyId, "EMAIL_LOG", logId, "RETRY_EMAIL", "Gửi lại email: " + log.getRecipientEmail());
        if (!sent) throw new CustomException(503, SMTP_FAILURE);

        return EmailLogRetryResponseDTO.builder()
                .logId(log.getId())
                .status(log.getStatus())
                .retriedAt(log.getRetriedAt())
                .build();
    }

    private EmailLogEntity find(Long companyId, Long logId) {
        return logs.findByIdAndCompanyId(logId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy lịch sử email trong company hiện tại."));
    }

    private String normalize(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private EmailLogDTO toDto(EmailLogEntity log) {
        return EmailLogDTO.builder()
                .id(log.getId())
                .applicationId(log.getApplicationId())
                .recipientEmail(log.getRecipientEmail())
                .templateCode(log.getTemplateCode())
                .status(log.getStatus())
                .subject(log.getSubject())
                .bodyHtml(log.getBodyHtml())
                .sentAt(log.getSentAt())
                .retriedAt(log.getRetriedAt())
                .errorMessage(log.getErrorMessage())
                .attemptCount(log.getAttemptCount())
                .createdAt(log.getCreatedAt())
                .build();
    }
}
