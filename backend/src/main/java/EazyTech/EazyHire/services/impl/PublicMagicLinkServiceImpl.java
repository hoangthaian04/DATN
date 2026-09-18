package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.PublicApplicationStatusResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicInterviewSummaryDTO;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.InterviewEntity;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.InterviewRepository;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.services.PublicMagicLinkService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicMagicLinkServiceImpl implements PublicMagicLinkService {

    private static final String ACTIVE = "ACTIVE";
    private static final String INVALID_LINK_MESSAGE =
            "Magic link không hợp lệ, đã hết hạn hoặc email xác minh không khớp.";
    private static final String RECOVERY_MESSAGE =
            "Nếu email của bạn đã ứng tuyển tại công ty, chúng tôi đã gửi liên kết tra cứu tới hộp thư của bạn.";

    private final ApplicationRepository applicationRepository;
    private final HiringRoundRepository hiringRoundRepository;
    private final InterviewRepository interviewRepository;
    private final EmailService emailService;

    @Value("${app.public-base-url:http://localhost:5173}")
    private String publicBaseUrl;

    @Value("${app.magic-link-ttl-days:30}")
    private long magicLinkTtlDays;

    @Override
    @Transactional(readOnly = true)
    public PublicApplicationStatusResponseDTO verify(String token, String email) {
        return getStatus(token, email);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicApplicationStatusResponseDTO getStatus(String token, String email) {
        ApplicationEntity application = findVerifiedApplication(token, email);
        return mapStatus(application);
    }

    @Override
    @Transactional
    public void requestRecovery(String email, String companySlug) {
        String normalizedEmail = normalizeEmail(email);
        String normalizedSlug = normalize(companySlug);
        List<ApplicationEntity> applications = applicationRepository
                .findByCompanySlugAndCandidateEmailAndStatus(normalizedSlug, normalizedEmail, ACTIVE);

        if (!applications.isEmpty()) {
            LocalDateTime expiry = LocalDateTime.now().plusDays(magicLinkTtlDays);
            applications.forEach(application -> {
                application.setSecureToken(UUID.randomUUID().toString());
                application.setTokenExpiryAt(expiry);
                applicationRepository.save(application);
            });
            sendRecoveryEmail(applications, expiry);
        }
        // Always return the same response. The controller must not reveal whether an email exists.
    }

    private ApplicationEntity findVerifiedApplication(String token, String email) {
        String normalizedToken = normalize(token);
        String normalizedEmail = normalizeEmail(email);
        ApplicationEntity application = applicationRepository.findBySecureToken(normalizedToken)
                .orElseThrow(() -> new CustomException(403, INVALID_LINK_MESSAGE));

        if (application.getCandidate() == null
                || application.getCandidate().getEmail() == null
                || !application.getCandidate().getEmail().trim().equalsIgnoreCase(normalizedEmail)
                || Boolean.TRUE.equals(application.getCandidate().getIsDeleted())
                || isExpired(application)) {
            throw new CustomException(403, INVALID_LINK_MESSAGE);
        }
        return application;
    }

    private boolean isExpired(ApplicationEntity application) {
        LocalDateTime expiresAt = application.getTokenExpiryAt();
        if (expiresAt == null && application.getAppliedAt() != null) {
            expiresAt = application.getAppliedAt().plusDays(magicLinkTtlDays);
        }
        return expiresAt == null || !expiresAt.isAfter(LocalDateTime.now());
    }

    private PublicApplicationStatusResponseDTO mapStatus(ApplicationEntity application) {
        String currentStage = "Chưa phân vòng";
        if (application.getCurrentRoundId() != null && application.getJob() != null && application.getCompany() != null) {
            currentStage = hiringRoundRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(
                            application.getCurrentRoundId(),
                            application.getJob().getId(),
                            application.getCompany().getId())
                    .map(HiringRoundEntity::getName)
                    .orElse("Vòng tuyển dụng không còn khả dụng");
        }

        List<PublicInterviewSummaryDTO> interviews = interviewRepository
                .findByApplicationIdOrderByInterviewTimeDesc(application.getId())
                .stream()
                .map(this::mapInterview)
                .toList();

        return PublicApplicationStatusResponseDTO.builder()
                .applicationId(application.getId())
                .candidateName(application.getCandidate().getFullName())
                .jobTitle(application.getJob().getTitle())
                .companyName(application.getCompany().getName())
                .applicationStatus(application.getStatus())
                .currentStage(currentStage)
                .lastUpdatedAt(application.getUpdatedAt())
                .expiresAt(effectiveExpiry(application))
                .interviews(interviews)
                .build();
    }

    private PublicInterviewSummaryDTO mapInterview(InterviewEntity interview) {
        return PublicInterviewSummaryDTO.builder()
                .id(interview.getId())
                .status(interview.getStatus())
                .interviewTime(interview.getInterviewTime())
                .duration(interview.getDuration())
                .location(interview.getLocation())
                .candidateNote(interview.getCandidateNote())
                .rescheduleTime(interview.getRescheduleTime())
                .rescheduleReason(interview.getRescheduleReason())
                .build();
    }

    private LocalDateTime effectiveExpiry(ApplicationEntity application) {
        if (application.getTokenExpiryAt() != null) return application.getTokenExpiryAt();
        return application.getAppliedAt() == null
                ? null
                : application.getAppliedAt().plusDays(magicLinkTtlDays);
    }

    private void sendRecoveryEmail(List<ApplicationEntity> applications, LocalDateTime expiry) {
        ApplicationEntity first = applications.get(0);
        String links = applications.stream()
                .map(application -> publicBaseUrl.replaceAll("/+$", "")
                        + "/careers/applications/track?token="
                        + URLEncoder.encode(application.getSecureToken(), StandardCharsets.UTF_8))
                .reduce((left, right) -> left + "\n" + right)
                .orElse("");
        String content = "Chào " + first.getCandidate().getFullName() + ",\n\n"
                + "Đây là liên kết mới để theo dõi hồ sơ ứng tuyển của bạn.\n"
                + links + "\n\n"
                + "Liên kết có hiệu lực đến " + expiry + ".";
        emailService.sendEmail(
                first.getCandidate().getEmail(),
                "Liên kết theo dõi hồ sơ mới - EasyHire",
                content
        );
    }

    private String normalizeEmail(String email) {
        String normalized = normalize(email).toLowerCase(Locale.ROOT);
        if (normalized.isBlank()) throw new CustomException(400, "Email là bắt buộc");
        return normalized;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim();
    }
}
