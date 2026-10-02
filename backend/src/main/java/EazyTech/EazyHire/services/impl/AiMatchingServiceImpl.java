package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.AiMatchingContactRequestDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingContactResponseDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingContactTemplateDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingRunResponseDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingTriggerRequestDTO;
import EazyTech.EazyHire.models.dtos.AiSuggestionResponseDTO;
import EazyTech.EazyHire.models.dtos.EmailTemplateDTO;
import EazyTech.EazyHire.models.entities.AiMatchingRunEntity;
import EazyTech.EazyHire.models.entities.AiSuggestionEntity;
import EazyTech.EazyHire.models.entities.CandidateEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.enums.AiMatchingRunStatus;
import EazyTech.EazyHire.models.enums.AiSuggestionContactStatus;
import EazyTech.EazyHire.models.enums.EmailTemplateType;
import EazyTech.EazyHire.repositories.AiMatchingRunRepository;
import EazyTech.EazyHire.repositories.AiSuggestionRepository;
import EazyTech.EazyHire.repositories.CandidateRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AiMatchingRunQueueService;
import EazyTech.EazyHire.services.AiMatchingService;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.EmailLogService;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.services.EmailTemplateService;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AiMatchingServiceImpl implements AiMatchingService {

    private static final BigDecimal DEFAULT_MIN_SCORE = BigDecimal.valueOf(70);
    private static final int DEFAULT_LIMIT = 10;

    private final JobRepository jobRepository;
    private final CandidateRepository candidateRepository;
    private final AiMatchingRunRepository runRepository;
    private final AiSuggestionRepository suggestionRepository;
    private final AiMatchingRunQueueService queueService;
    private final EmailTemplateService emailTemplateService;
    private final EmailService emailService;
    private final EmailLogService emailLogService;
    private final AuditService auditService;

    @Override
    @Transactional
    public void enqueueForPublishedJob(Long jobId, Long companyId, Long userId) {
        AiMatchingRunEntity run = AiMatchingRunEntity.builder()
                .jobId(jobId)
                .companyId(companyId)
                .requestedBy(userId)
                .minScore(DEFAULT_MIN_SCORE)
                .resultLimit(DEFAULT_LIMIT)
                .forceRerun(false)
                .status(AiMatchingRunStatus.QUEUED)
                .build();
        createOrReturnActive(run);
    }

    @Override
    @Transactional
    public AiMatchingRunResponseDTO trigger(Long jobId, Long companyId, Long userId,
                                            AiMatchingTriggerRequestDTO request) {
        JobEntity job = requireJob(jobId, companyId);
        if (!"ACTIVE".equals(job.getStatus())) {
            throw new CustomException(409, "Chỉ có thể chạy AI Match cho Job đang ở trạng thái ACTIVE");
        }

        AiMatchingTriggerRequestDTO normalized = request == null ? new AiMatchingTriggerRequestDTO() : request;
        BigDecimal minScore = normalized.getMinScore() == null ? DEFAULT_MIN_SCORE : normalized.getMinScore();
        Integer resultLimit = normalized.getLimit() == null ? DEFAULT_LIMIT : normalized.getLimit();
        boolean forceRerun = Boolean.TRUE.equals(normalized.getForceRerun());

        AiMatchingRunEntity active = queueService.activeRun(jobId, companyId).orElse(null);
        if (active != null) return toResponse(active);

        if (!forceRerun && suggestionRepository.existsByJobIdAndCompanyId(jobId, companyId)) {
            return runRepository.findFirstByJobIdAndCompanyIdOrderByCreatedAtDesc(jobId, companyId)
                    .map(this::toResponse)
                    .orElseThrow(() -> new CustomException(409, "Đã có kết quả AI Match; đặt forceRerun=true để chạy lại"));
        }

        AiMatchingRunEntity run = AiMatchingRunEntity.builder()
                .jobId(jobId)
                .companyId(companyId)
                .requestedBy(userId)
                .minScore(minScore)
                .resultLimit(resultLimit)
                .forceRerun(forceRerun)
                .status(AiMatchingRunStatus.QUEUED)
                .build();
        AiMatchingRunEntity queued = createOrReturnActive(run);
        auditService.recordTarget(userId, companyId, "JOB", jobId, "TRIGGER_AI_MATCHING",
                "Đã xếp hàng AI Match run " + queued.getId());
        return toResponse(queued);
    }

    @Override
    @Transactional(readOnly = true)
    public AiMatchingRunResponseDTO getLatestRun(Long jobId, Long companyId) {
        requireJob(jobId, companyId);
        return runRepository.findFirstByJobIdAndCompanyIdOrderByCreatedAtDesc(jobId, companyId)
                .map(this::toResponse)
                .orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiSuggestionResponseDTO> listSuggestions(Long jobId, Long companyId) {
        requireJob(jobId, companyId);
        return suggestionRepository.findForJob(jobId, companyId).stream()
                .map(suggestion -> toSuggestionResponse(suggestion, companyId))
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    @Override
    @Transactional
    public AiMatchingContactTemplateDTO getContactTemplate(Long jobId, Long suggestionId, Long companyId) {
        JobEntity job = requireJob(jobId, companyId);
        AiSuggestionEntity suggestion = requireSuggestion(jobId, suggestionId, companyId);
        CandidateEntity candidate = requireCandidate(suggestion.getCandidateId(), companyId);
        EmailTemplateDTO template = emailTemplateService.getDefaultTemplate(companyId, EmailTemplateType.AI_MATCH_INVITE);
        return AiMatchingContactTemplateDTO.builder()
                .suggestionId(suggestionId)
                .recipientName(candidate.getFullName())
                .recipientEmail(candidate.getEmail())
                .subject(render(template.getSubject(), candidate, job))
                .body(render(template.getBodyHtml(), candidate, job))
                .build();
    }

    @Override
    @Transactional
    public AiMatchingContactResponseDTO contact(Long jobId, Long suggestionId, Long companyId, Long userId,
                                                AiMatchingContactRequestDTO request) {
        JobEntity job = requireJob(jobId, companyId);
        if (!"ACTIVE".equals(job.getStatus())) {
            throw new CustomException(409, "Chỉ có thể gửi lời mời cho Job đang ở trạng thái ACTIVE");
        }
        if (request == null || request.getSubject() == null || request.getSubject().isBlank()
                || request.getBody() == null || request.getBody().isBlank()) {
            throw new CustomException(400, "Tiêu đề và nội dung email không được để trống");
        }

        AiSuggestionEntity suggestion = suggestionRepository
                .findForContactForUpdate(suggestionId, jobId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy ứng viên gợi ý trong workspace hiện tại"));
        if (suggestion.getContactStatus() == AiSuggestionContactStatus.CONTACTED) {
            throw new CustomException(409, "Ứng viên này đã được liên hệ trước đó");
        }
        CandidateEntity candidate = requireCandidate(suggestion.getCandidateId(), companyId);
        String subject = request.getSubject().trim();
        String body = request.getBody().trim();
        boolean sent = emailService.sendEmail(candidate.getEmail(), subject, body);
        var emailLog = emailLogService.record(companyId, null, candidate.getEmail(), "AI_MATCH_INVITE",
                subject, body, sent);
        if (!sent) {
            throw new CustomException(503, "Không gửi được email mời ứng tuyển. Kiểm tra SMTP/Mailpit; email lỗi đã được lưu trong Email Log.");
        }

        LocalDateTime contactedAt = LocalDateTime.now();
        suggestion.setContactStatus(AiSuggestionContactStatus.CONTACTED);
        suggestion.setContactedAt(contactedAt);
        suggestionRepository.save(suggestion);
        auditService.recordTarget(userId, companyId, "AI_SUGGESTION", suggestionId, "CONTACT_AI_MATCH_CANDIDATE",
                "Đã gửi lời mời ứng tuyển tới ứng viên cho Job " + jobId);
        return AiMatchingContactResponseDTO.builder()
                .suggestionId(suggestionId)
                .emailLogId(emailLog.getId())
                .contactStatus(AiSuggestionContactStatus.CONTACTED)
                .contactedAt(contactedAt)
                .build();
    }

    private AiMatchingRunEntity createOrReturnActive(AiMatchingRunEntity run) {
        try {
            return queueService.enqueue(run);
        } catch (DataIntegrityViolationException exception) {
            return queueService.activeRun(run.getJobId(), run.getCompanyId())
                    .orElseThrow(() -> new CustomException(409, "Đang có yêu cầu AI Match khác cho Job này", exception));
        }
    }

    private JobEntity requireJob(Long jobId, Long companyId) {
        if (companyId == null) throw new CustomException(403, "Tài khoản chưa thuộc workspace tuyển dụng hợp lệ");
        return jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(jobId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy Job trong workspace hiện tại"));
    }

    private AiSuggestionEntity requireSuggestion(Long jobId, Long suggestionId, Long companyId) {
        return suggestionRepository.findByIdAndJobIdAndCompanyId(suggestionId, jobId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy ứng viên gợi ý trong workspace hiện tại"));
    }

    private CandidateEntity requireCandidate(Long candidateId, Long companyId) {
        return candidateRepository.findByIdAndCompanyIdAndIsDeletedFalse(candidateId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy ứng viên trong workspace hiện tại"));
    }

    private AiSuggestionResponseDTO toSuggestionResponse(AiSuggestionEntity suggestion, Long companyId) {
        CandidateEntity candidate = candidateRepository.findByIdAndCompanyIdAndIsDeletedFalse(
                suggestion.getCandidateId(), companyId
        ).orElse(null);
        if (candidate == null) return null;
        return AiSuggestionResponseDTO.builder()
                .suggestionId(suggestion.getId())
                .candidateId(candidate.getId())
                .candidateName(candidate.getFullName())
                .email(candidate.getEmail())
                .matchingScore(suggestion.getMatchingScore())
                .matchedSkills(suggestion.getMatchedSkills())
                .strengths(suggestion.getStrengths())
                .contactStatus(suggestion.getContactStatus())
                .contactedAt(suggestion.getContactedAt())
                .recentApplicationAt(suggestion.getRecentApplicationAt())
                .createdAt(suggestion.getCreatedAt())
                .build();
    }

    private AiMatchingRunResponseDTO toResponse(AiMatchingRunEntity run) {
        return AiMatchingRunResponseDTO.builder()
                .jobId(run.getJobId())
                .matchingJobId(run.getId())
                .status(run.getStatus())
                .minScore(run.getMinScore())
                .limit(run.getResultLimit())
                .errorMessage(run.getErrorMessage())
                .createdAt(run.getCreatedAt())
                .startedAt(run.getStartedAt())
                .completedAt(run.getCompletedAt())
                .build();
    }

    private String render(String template, CandidateEntity candidate, JobEntity job) {
        if (template == null) return "";
        return template
                .replace("{{candidateName}}", candidate.getFullName())
                .replace("{{jobTitle}}", job.getTitle())
                .replace("{{companyName}}", job.getCompany().getName());
    }
}
