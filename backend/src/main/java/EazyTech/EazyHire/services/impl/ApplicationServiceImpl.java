package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.EmailTemplateEntity;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.models.enums.EmailTemplateType;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.EmailTemplateRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.ApplicationService;
import EazyTech.EazyHire.services.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.List;
import java.util.stream.Collectors;
import EazyTech.EazyHire.models.dtos.ApplicationDetailResponseDTO;

@Service
@RequiredArgsConstructor
@Slf4j
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final HiringRoundRepository hiringRoundRepository;
    private final EmailTemplateRepository emailTemplateRepository;
    private final EmailService emailService;

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationListResponseDTO> getApplicationsForJob(Long companyId, Long jobId, String status, PaginationRequest paginationRequest) {
        if (jobId != null) {
            boolean jobExists = jobRepository.existsByIdAndCompanyId(jobId, companyId);
            if (!jobExists) {
                throw new CustomException(404, "Không tìm thấy công việc");
            }
        }

        Pageable pageable;
        if (paginationRequest.getOrderBy() != null && !paginationRequest.getOrderBy().isEmpty()) {
            String[] sortParams = paginationRequest.getOrderBy().split(":");
            String sortField = sortParams[0];
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("DESC") 
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            pageable = PageRequest.of(paginationRequest.getPage() - 1, paginationRequest.getLimit(), Sort.by(direction, sortField));
        } else {
            pageable = PageRequest.of(paginationRequest.getPage() - 1, paginationRequest.getLimit(), Sort.by(Sort.Direction.DESC, "appliedAt"));
        }

        return applicationRepository.findApplicationsForListView(jobId, companyId, status, pageable);
    }

    @Override
    @Transactional
    public ApplicationListResponseDTO updateApplicationRound(Long companyId, Long applicationId, Long targetRoundId, String status) {
        ApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy hồ sơ ứng tuyển"));

        if (!application.getCompany().getId().equals(companyId)) {
            throw new CustomException(403, "Không có quyền truy cập hồ sơ này");
        }

        HiringRoundEntity targetRound = null;
        if (targetRoundId != null) {
            targetRound = hiringRoundRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(
                    targetRoundId, application.getJob().getId(), companyId)
                    .orElseThrow(() -> new CustomException(404, "Vòng tuyển dụng không hợp lệ"));

            application.setCurrentRoundId(targetRoundId);
        }

        if (status != null && !status.trim().isEmpty()) {
            application.setStatus(status);
        }

        applicationRepository.save(application);

        // Khi ứng viên được chuyển sang vòng mới thành công, tự động gửi email thông báo kết quả đỗ vòng đó
        if (targetRound != null) {
            sendPassEmailForRound(application, targetRound, companyId);
        }

        return ApplicationListResponseDTO.builder()
                .applicationId(application.getId())
                .candidateId(application.getCandidate().getId())
                .fullName(application.getCandidate().getFullName())
                .jobTitle(application.getJob().getTitle())
                .phone(application.getCandidate().getPhone())
                .email(application.getCandidate().getEmail())
                .applicationStatus(application.getStatus())
                .currentRoundId(application.getCurrentRoundId())
                .appliedAt(application.getAppliedAt())
                .build();
    }

    private void sendPassEmailForRound(ApplicationEntity application, HiringRoundEntity targetRound, Long companyId) {
        try {
            String candidateEmail = application.getCandidate().getEmail();
            if (candidateEmail == null || candidateEmail.trim().isEmpty()) {
                return;
            }

            String candidateName = application.getCandidate().getFullName();
            String jobTitle = application.getJob().getTitle();
            String companyName = application.getCompany().getName();
            String roundName = targetRound.getName();

            String subject = "[EasyTech Hire] Thông báo vượt qua vòng tuyển dụng vị trí " + jobTitle;
            String body = "Kính gửi " + candidateName + ",\n\n" +
                    "Chúc mừng bạn đã vượt qua vòng tuyển dụng vị trí " + jobTitle + " tại " + companyName + ".\n" +
                    "Hồ sơ của bạn đã được chuyển sang vòng tuyển dụng tiếp theo: " + roundName + ".\n\n" +
                    "Bộ phận nhân sự sẽ liên hệ với bạn trong thời gian sớm nhất để hướng dẫn các bước tiếp theo.\n\n" +
                    "Trân trọng,\n" +
                    "Đội ngũ Tuyển dụng " + companyName;

            // Nếu vòng có mẫu email Pass riêng
            if (targetRound.getPassEmailTemplateId() != null) {
                Optional<EmailTemplateEntity> templateOpt = emailTemplateRepository
                        .findByIdAndCompanyIdAndIsDeletedFalse(targetRound.getPassEmailTemplateId(), companyId);
                if (templateOpt.isPresent()) {
                    EmailTemplateEntity template = templateOpt.get();
                    if (template.getSubject() != null) subject = template.getSubject();
                    if (template.getBodyHtml() != null) body = template.getBodyHtml();
                }
            } else {
                // Thử tìm mẫu email loại PASS của công ty
                Page<EmailTemplateEntity> page = emailTemplateRepository
                        .findByCompanyIdAndIsDeletedFalseAndTypeAndIsActiveTrue(companyId, EmailTemplateType.PASS, PageRequest.of(0, 1));
                if (page.hasContent()) {
                    EmailTemplateEntity template = page.getContent().get(0);
                    if (template.getSubject() != null) subject = template.getSubject();
                    if (template.getBodyHtml() != null) body = template.getBodyHtml();
                }
            }

            // Replace placeholders
            subject = subject.replace("{{candidate_name}}", candidateName)
                             .replace("{{job_title}}", jobTitle)
                             .replace("{{round_name}}", roundName)
                             .replace("{{company_name}}", companyName);

            body = body.replace("{{candidate_name}}", candidateName)
                       .replace("{{job_title}}", jobTitle)
                       .replace("{{round_name}}", roundName)
                       .replace("{{company_name}}", companyName);

            emailService.sendEmail(candidateEmail, subject, body);
            log.info("Pass email sent successfully to {} for application {}", candidateEmail, application.getId());
        } catch (Exception e) {
            log.error("Failed to send pass email for application {}", application.getId(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationDetailResponseDTO getApplicationDetail(Long companyId, Long applicationId) {
        ApplicationEntity application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy hồ sơ ứng tuyển"));

        if (!application.getCompany().getId().equals(companyId)) {
            throw new CustomException(403, "Không có quyền truy cập hồ sơ này");
        }

        List<HiringRoundEntity> rounds = hiringRoundRepository
                .findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(application.getJob().getId(), companyId);

        HiringRoundEntity currentRound = null;
        int currentOrder = 1;
        int totalRounds = rounds.size() > 0 ? rounds.size() : 1;

        if (application.getCurrentRoundId() != null) {
            for (HiringRoundEntity r : rounds) {
                if (r.getId().equals(application.getCurrentRoundId())) {
                    currentRound = r;
                    currentOrder = r.getOrderIndex();
                    break;
                }
            }
        } else if (!rounds.isEmpty()) {
            currentRound = rounds.get(0);
            currentOrder = currentRound.getOrderIndex();
        }

        final int finalCurrentOrder = currentOrder;
        List<ApplicationDetailResponseDTO.RoundHistoryDTO> history = rounds.stream().map(r -> {
            boolean isCurrent = application.getCurrentRoundId() != null
                    ? r.getId().equals(application.getCurrentRoundId())
                    : r.getOrderIndex() == 1;

            boolean isPassed = r.getOrderIndex() < finalCurrentOrder;

            return ApplicationDetailResponseDTO.RoundHistoryDTO.builder()
                    .roundId(r.getId())
                    .roundName(r.getName())
                    .orderIndex(r.getOrderIndex())
                    .isCurrent(isCurrent)
                    .isPassed(isPassed)
                    .build();
        }).collect(Collectors.toList());

        return ApplicationDetailResponseDTO.builder()
                .applicationId(application.getId())
                .candidateId(application.getCandidate().getId())
                .fullName(application.getCandidate().getFullName())
                .email(application.getCandidate().getEmail())
                .phone(application.getCandidate().getPhone())
                .avatarUrl(application.getCandidate().getAvatarUrl())
                .jobId(application.getJob().getId())
                .jobTitle(application.getJob().getTitle())
                .location(application.getJob().getLocation())
                .workingType(application.getJob().getWorkingType())
                .applicationStatus(application.getStatus())
                .currentRoundId(currentRound != null ? currentRound.getId() : null)
                .currentRoundName(currentRound != null ? currentRound.getName() : "Vòng khởi tạo")
                .currentRoundOrder(currentOrder)
                .totalRounds(totalRounds)
                .cvUrl(application.getCvUrl())
                .coverLetter(application.getCoverLetter())
                .source(application.getSource())
                .appliedAt(application.getAppliedAt())
                .roundHistory(history)
                .build();
    }
}
