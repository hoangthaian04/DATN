package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.CareerSiteEntity;
import EazyTech.EazyHire.models.entities.CandidateEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.FormFieldEntity;
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
import EazyTech.EazyHire.services.EmailLogService;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.services.impl.PublicApplicationServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.ArgumentCaptor;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicApplicationServiceImplTest {

    @Mock private JobRepository jobRepository;
    @Mock private CareerSiteRepository careerSiteRepository;
    @Mock private CandidateRepository candidateRepository;
    @Mock private ApplicationRepository applicationRepository;
    @Mock private ApplicationAnswerRepository applicationAnswerRepository;
    @Mock private FormFieldRepository formFieldRepository;
    @Mock private HiringRoundRepository hiringRoundRepository;
    @Mock private UserRepository userRepository;
    @Mock private CvStorageService cvStorageService;
    @Mock private EmailLogService emailLogService;
    @Mock private EmailService emailService;
    @Mock private MultipartFile cvFile;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks private PublicApplicationServiceImpl service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "publicBaseUrl", "http://localhost:5173");
        ReflectionTestUtils.setField(service, "magicLinkTtlDays", 30L);
    }

    @Test
    void createsApplicationAnswersAndNotifiesApplicantAndResponsibleHr() {
        CompanyEntity company = company();
        UserEntity hr = UserEntity.builder()
                .id(8L).company(company).email("hr@easytech.vn")
                .role(UserRole.HR).status(UserStatus.ACTIVE).build();
        JobEntity job = job(company, hr);
        FormFieldEntity field = FormFieldEntity.builder()
                .id(31L).company(company).job(job).fieldName("portfolio_url")
                .label("Portfolio URL").fieldType(FormFieldType.URL)
                .isRequired(true).options(List.of()).isDeleted(false).orderIndex(0).build();
        CandidateEntity candidate = CandidateEntity.builder()
                .id(41L).company(company).fullName("Tran B").email("candidate@gmail.com")
                .phone("0901234567").isDeleted(false).build();
        ApplicationEntity saved = ApplicationEntity.builder()
                .id(301L).company(company).job(job).candidate(candidate)
                .status("ACTIVE").secureToken("token-301")
                .appliedAt(LocalDateTime.of(2026, 9, 18, 14, 0)).build();

        when(jobRepository.findById(20L)).thenReturn(Optional.of(job));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(
                CareerSiteEntity.builder().company(company).isPublished(true).build()));
        when(candidateRepository.findByCompanyIdAndEmailIgnoreCase(1L, "candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));
        when(candidateRepository.save(any(CandidateEntity.class))).thenReturn(candidate);
        when(applicationRepository.findByJobIdAndCandidateIdAndStatus(20L, 41L, "ACTIVE"))
                .thenReturn(Optional.empty());
        when(formFieldRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(20L, 1L))
                .thenReturn(List.of(field));
        when(cvStorageService.store(1L, 20L, cvFile)).thenReturn("private://candidate-cvs/1/20/cv.pdf");
        when(hiringRoundRepository.findFirstByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(20L, 1L))
                .thenReturn(Optional.empty());
        when(applicationRepository.save(any(ApplicationEntity.class))).thenReturn(saved);

        var result = service.apply(
                20L, "Tran B", "candidate@gmail.com", "0901234567",
                "Tôi quan tâm", cvFile,
                "[{\"questionId\":31,\"answer\":\"https://github.com/tranb\"}]",
                true
        );

        assertEquals(301L, result.getId());
        assertEquals("ACTIVE", result.getApplicationStatus());
        assertEquals("token-301", result.getTrackingToken());
        verify(applicationAnswerRepository).saveAll(any());
        ArgumentCaptor<String> applicantEmail = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendEmail(eq("candidate@gmail.com"), eq("Đã nhận hồ sơ ứng tuyển - Frontend Engineer"), applicantEmail.capture());
        assertEquals(true, applicantEmail.getValue().contains("/careers/easytech/track-request"));
        verify(emailService).sendEmail(eq("hr@easytech.vn"), eq("Ứng viên mới - Frontend Engineer"), any());
    }

    @Test
    void blocksAnActiveDuplicateBeforeUploadingCv() {
        CompanyEntity company = company();
        JobEntity job = job(company, null);
        CandidateEntity candidate = CandidateEntity.builder().id(41L).company(company)
                .email("candidate@gmail.com").isDeleted(false).build();
        ApplicationEntity existing = ApplicationEntity.builder()
                .id(300L).appliedAt(LocalDateTime.of(2026, 9, 1, 10, 0)).status("ACTIVE").build();

        when(jobRepository.findById(20L)).thenReturn(Optional.of(job));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(
                CareerSiteEntity.builder().company(company).isPublished(true).build()));
        when(candidateRepository.findByCompanyIdAndEmailIgnoreCase(1L, "candidate@gmail.com"))
                .thenReturn(Optional.of(candidate));
        when(applicationRepository.findByJobIdAndCandidateIdAndStatus(20L, 41L, "ACTIVE"))
                .thenReturn(Optional.of(existing));

        CustomException exception = assertThrows(CustomException.class, () -> service.apply(
                20L, "Tran B", "candidate@gmail.com", "0901234567", null,
                cvFile, "[]", true
        ));

        assertEquals(409, exception.getStatusCode());
        verify(candidateRepository, never()).save(any(CandidateEntity.class));
        verify(cvStorageService, never()).store(any(), any(), any());
    }

    @Test
    void blocksApplicationForClosedJobBeforeUploadingCv() {
        CompanyEntity company = company();
        JobEntity job = job(company, null);
        job.setStatus("CLOSED");
        when(jobRepository.findById(20L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(CustomException.class, () -> service.apply(
                20L, "Tran B", "candidate@gmail.com", "0901234567", null,
                cvFile, "[]", true
        ));

        assertEquals(404, exception.getStatusCode());
        verify(cvStorageService, never()).store(any(), any(), any());
    }

    @Test
    void requiresEveryRequiredDynamicFieldBeforeUploadingCv() {
        CompanyEntity company = company();
        JobEntity job = job(company, null);
        FormFieldEntity requiredField = FormFieldEntity.builder()
                .id(31L).company(company).job(job).label("Portfolio")
                .fieldType(FormFieldType.URL).isRequired(true).options(List.of())
                .isDeleted(false).orderIndex(0).build();

        when(jobRepository.findById(20L)).thenReturn(Optional.of(job));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(
                CareerSiteEntity.builder().company(company).isPublished(true).build()));
        when(candidateRepository.findByCompanyIdAndEmailIgnoreCase(1L, "candidate@gmail.com"))
                .thenReturn(Optional.empty());
        when(candidateRepository.save(any(CandidateEntity.class))).thenAnswer(invocation -> {
            CandidateEntity value = invocation.getArgument(0);
            value.setId(41L);
            return value;
        });
        when(formFieldRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(20L, 1L))
                .thenReturn(List.of(requiredField));

        CustomException exception = assertThrows(CustomException.class, () -> service.apply(
                20L, "Tran B", "candidate@gmail.com", "0901234567", null,
                cvFile, "[]", true
        ));

        assertEquals(400, exception.getStatusCode());
        verify(cvStorageService, never()).store(any(), any(), any());
    }

    private CompanyEntity company() {
        return CompanyEntity.builder().id(1L).name("EasyTech").slug("easytech")
                .status(CompanyStatus.ACTIVE).build();
    }

    private JobEntity job(CompanyEntity company, UserEntity createdBy) {
        return JobEntity.builder().id(20L).company(company).createdBy(createdBy)
                .title("Frontend Engineer").slug("frontend-engineer")
                .status("ACTIVE").isDeleted(false).build();
    }
}
