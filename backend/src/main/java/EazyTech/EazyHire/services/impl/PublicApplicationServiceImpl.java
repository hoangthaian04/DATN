package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.PublicApplicationAnswerDTO;
import EazyTech.EazyHire.models.dtos.PublicApplicationResponseDTO;
import EazyTech.EazyHire.models.entities.ApplicationAnswerEntity;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.CareerSiteEntity;
import EazyTech.EazyHire.models.entities.CandidateEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.FormFieldEntity;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.FormFieldType;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.repositories.ApplicationAnswerRepository;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.CandidateRepository;
import EazyTech.EazyHire.repositories.CareerSiteRepository;
import EazyTech.EazyHire.repositories.FormFieldRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.services.CvStorageService;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.services.PublicApplicationService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class PublicApplicationServiceImpl implements PublicApplicationService {

    private static final String ACTIVE = "ACTIVE";
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\+?[0-9][0-9 ()-]{6,19}$");

    private final JobRepository jobRepository;
    private final CareerSiteRepository careerSiteRepository;
    private final CandidateRepository candidateRepository;
    private final ApplicationRepository applicationRepository;
    private final ApplicationAnswerRepository applicationAnswerRepository;
    private final FormFieldRepository formFieldRepository;
    private final HiringRoundRepository hiringRoundRepository;
    private final UserRepository userRepository;
    private final CvStorageService cvStorageService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @Value("${app.public-base-url:http://localhost:5173}")
    private String publicBaseUrl;

    @Value("${app.magic-link-ttl-days:30}")
    private long magicLinkTtlDays;

    @Override
    @Transactional
    public PublicApplicationResponseDTO apply(
            Long jobId,
            String fullName,
            String email,
            String phone,
            String coverLetter,
            MultipartFile cvFile,
            String answers,
            Boolean consentAccepted
    ) {
        JobEntity job = getPublicJob(jobId);
        validateRequest(fullName, email, phone, coverLetter, consentAccepted);

        String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
        Optional<CandidateEntity> existingCandidate = candidateRepository
                .findByCompanyIdAndEmailIgnoreCase(job.getCompany().getId(), normalizedEmail);
        if (existingCandidate.isPresent()) {
            applicationRepository.findByJobIdAndCandidateIdAndStatus(jobId, existingCandidate.get().getId(), ACTIVE)
                    .ifPresent(existing -> {
                        throw new CustomException(409, "Bạn đã ứng tuyển vị trí này vào ngày "
                                + existing.getAppliedAt().toLocalDate() + ". Vui lòng xem trạng thái hồ sơ.");
                    });
        }
        CandidateEntity candidate = findOrCreateCandidate(
                existingCandidate.orElse(null), job.getCompany(), fullName, normalizedEmail, phone
        );

        List<FormFieldEntity> fields = formFieldRepository
                .findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(jobId, job.getCompany().getId());
        List<PublicApplicationAnswerDTO> submittedAnswers = parseAnswers(answers);
        Map<Long, String> answerByFieldId = validateAnswers(fields, submittedAnswers);

        String cvUrl = cvStorageService.store(job.getCompany().getId(), jobId, cvFile);
        HiringRoundEntity firstRound = hiringRoundRepository
                .findFirstByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(
                        jobId, job.getCompany().getId()
                )
                .orElse(null);

        ApplicationEntity application = ApplicationEntity.builder()
                .company(job.getCompany())
                .job(job)
                .candidate(candidate)
                .currentRoundId(firstRound == null ? null : firstRound.getId())
                .currentStep(0)
                .cvUrl(cvUrl)
                .coverLetter(normalizeOptional(coverLetter))
                .status(ACTIVE)
                .source("CAREER_SITE")
                .secureToken(UUID.randomUUID().toString())
                .tokenExpiryAt(LocalDateTime.now().plusDays(magicLinkTtlDays))
                .consentAccepted(true)
                .consentAcceptedAt(LocalDateTime.now())
                .appliedAt(LocalDateTime.now())
                .build();
        ApplicationEntity saved = applicationRepository.save(application);

        List<ApplicationAnswerEntity> answerEntities = answerByFieldId.entrySet().stream()
                .map(entry -> ApplicationAnswerEntity.builder()
                        .application(saved)
                        .formField(fields.stream()
                                .filter(field -> field.getId().equals(entry.getKey()))
                                .findFirst()
                                .orElseThrow())
                        .answerValue(entry.getValue())
                        .build())
                .toList();
        if (!answerEntities.isEmpty()) applicationAnswerRepository.saveAll(answerEntities);

        notifyApplicant(saved);
        notifyResponsibleHr(job, saved);

        return PublicApplicationResponseDTO.builder()
                .id(saved.getId())
                .applicationStatus(saved.getStatus())
                .trackingToken(saved.getSecureToken())
                .submittedAt(saved.getAppliedAt())
                .build();
    }

    private JobEntity getPublicJob(Long jobId) {
        if (jobId == null || jobId < 1) throw new CustomException(400, "jobId không hợp lệ");
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy tin tuyển dụng public"));
        CompanyEntity company = job.getCompany();
        CareerSiteEntity careerSite = company == null
                ? null
                : careerSiteRepository.findByCompanyId(company.getId()).orElse(null);
        if (company == null
                || company.getStatus() != CompanyStatus.ACTIVE
                || !ACTIVE.equals(job.getStatus())
                || Boolean.TRUE.equals(job.getIsDeleted())
                || careerSite == null
                || !Boolean.TRUE.equals(careerSite.getIsPublished())) {
            throw new CustomException(404, "Không tìm thấy tin tuyển dụng public");
        }
        return job;
    }

    private void validateRequest(
            String fullName,
            String email,
            String phone,
            String coverLetter,
            Boolean consentAccepted
    ) {
        if (fullName == null || fullName.isBlank() || fullName.trim().length() > 255) {
            throw new CustomException(400, "Họ tên là bắt buộc và không được vượt quá 255 ký tự");
        }
        if (email == null || email.isBlank() || email.trim().length() > 255
                || !EMAIL_PATTERN.matcher(email.trim()).matches()) {
            throw new CustomException(400, "Email không hợp lệ");
        }
        if (phone == null || phone.isBlank() || !PHONE_PATTERN.matcher(phone.trim()).matches()) {
            throw new CustomException(400, "Số điện thoại không hợp lệ");
        }
        if (coverLetter != null && coverLetter.length() > 10000) {
            throw new CustomException(400, "Cover letter không được vượt quá 10000 ký tự");
        }
        if (!Boolean.TRUE.equals(consentAccepted)) {
            throw new CustomException(400, "Bạn cần đồng ý chính sách xử lý dữ liệu cá nhân");
        }
    }

    private CandidateEntity findOrCreateCandidate(
            CandidateEntity existingCandidate,
            CompanyEntity company,
            String fullName,
            String email,
            String phone
    ) {
        CandidateEntity candidate = existingCandidate == null
                ? CandidateEntity.builder().company(company).email(email).build()
                : existingCandidate;
        candidate.setCompany(company);
        candidate.setFullName(fullName.trim());
        candidate.setEmail(email);
        candidate.setPhone(phone.trim());
        candidate.setIsDeleted(false);
        return candidateRepository.save(candidate);
    }

    private List<PublicApplicationAnswerDTO> parseAnswers(String rawAnswers) {
        if (rawAnswers == null || rawAnswers.isBlank()) return List.of();
        try {
            List<PublicApplicationAnswerDTO> parsed = objectMapper.readValue(
                    rawAnswers,
                    new TypeReference<>() { }
            );
            return parsed == null ? List.of() : parsed;
        } catch (JsonProcessingException exception) {
            throw new CustomException(400, "answers phải là JSON array hợp lệ");
        }
    }

    private Map<Long, String> validateAnswers(
            List<FormFieldEntity> fields,
            List<PublicApplicationAnswerDTO> submittedAnswers
    ) {
        Map<Long, FormFieldEntity> fieldsById = new HashMap<>();
        fields.forEach(field -> fieldsById.put(field.getId(), field));
        Map<Long, String> answerByFieldId = new HashMap<>();
        Set<Long> duplicateGuard = new HashSet<>();

        for (PublicApplicationAnswerDTO answer : submittedAnswers) {
            if (answer == null || answer.getQuestionId() == null
                    || !duplicateGuard.add(answer.getQuestionId())) {
                throw new CustomException(400, "Câu trả lời form không hợp lệ hoặc bị trùng");
            }
            FormFieldEntity field = fieldsById.get(answer.getQuestionId());
            if (field == null) throw new CustomException(400, "Câu hỏi form không thuộc Job này");
            String value = answer.getAnswer() == null ? "" : answer.getAnswer().trim();
            validateFieldValue(field, value);
            if (!value.isBlank()) answerByFieldId.put(field.getId(), value);
        }

        for (FormFieldEntity field : fields) {
            if (Boolean.TRUE.equals(field.getIsRequired())
                    && !answerByFieldId.containsKey(field.getId())) {
                throw new CustomException(400, "Vui lòng trả lời trường bắt buộc: " + field.getLabel());
            }
        }
        return answerByFieldId;
    }

    private void validateFieldValue(FormFieldEntity field, String value) {
        if (value.length() > 10000) {
            throw new CustomException(400, "Câu trả lời không được vượt quá 10000 ký tự");
        }
        if (field.getFieldType() == FormFieldType.SELECT
                && (field.getOptions() == null || !field.getOptions().contains(value))) {
            throw new CustomException(400, "Lựa chọn không hợp lệ cho trường: " + field.getLabel());
        }
        if (field.getFieldType() == FormFieldType.URL && !value.isBlank()
                && !(value.startsWith("http://") || value.startsWith("https://"))) {
            throw new CustomException(400, "URL không hợp lệ cho trường: " + field.getLabel());
        }
    }

    private void notifyApplicant(ApplicationEntity application) {
        String trackingUrl = publicBaseUrl.replaceAll("/+$", "")
                + "/careers/applications/track?token="
                + URLEncoder.encode(application.getSecureToken(), StandardCharsets.UTF_8);
        String recoveryUrl = publicBaseUrl.replaceAll("/+$", "")
                + "/careers/" + application.getJob().getCompany().getSlug() + "/track-request";
        String content = "Chào " + application.getCandidate().getFullName() + ",\n\n"
                + "EasyTech đã nhận hồ sơ của bạn cho vị trí " + application.getJob().getTitle() + ".\n"
                + "Bạn có thể theo dõi hồ sơ tại: " + trackingUrl + "\n\n"
                + "Mất hoặc hết hạn liên kết? Bạn có thể yêu cầu gửi lại tại: " + recoveryUrl + "\n\n"
                + "Mã theo dõi: " + application.getSecureToken();
        emailService.sendEmail(
                application.getCandidate().getEmail(),
                "Đã nhận hồ sơ ứng tuyển - " + application.getJob().getTitle(),
                content
        );
    }

    private void notifyResponsibleHr(JobEntity job, ApplicationEntity application) {
        String subject = "Ứng viên mới - " + job.getTitle();
        String content = "Job " + job.getTitle() + " vừa nhận hồ sơ mới từ "
                + application.getCandidate().getFullName() + " ("
                + application.getCandidate().getEmail() + ").";
        UserEntity responsibleUser = job.getCreatedBy();
        if (responsibleUser != null
                && responsibleUser.getStatus() == UserStatus.ACTIVE
                && (responsibleUser.getRole() == UserRole.HR || responsibleUser.getRole() == UserRole.HR_ADMIN)) {
            emailService.sendEmail(responsibleUser.getEmail(), subject, content);
            return;
        }
        userRepository.findByCompanyId(job.getCompany().getId()).stream()
                .filter(user -> user.getStatus() == UserStatus.ACTIVE)
                .filter(user -> user.getRole() == UserRole.HR || user.getRole() == UserRole.HR_ADMIN)
                .forEach(user -> emailService.sendEmail(user.getEmail(), subject, content));
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
