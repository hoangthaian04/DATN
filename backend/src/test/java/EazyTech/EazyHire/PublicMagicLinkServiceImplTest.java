package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.CandidateEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.InterviewEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.InterviewRepository;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.services.EmailLogService;
import EazyTech.EazyHire.services.impl.PublicMagicLinkServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicMagicLinkServiceImplTest {

    @Mock private ApplicationRepository applicationRepository;
    @Mock private HiringRoundRepository hiringRoundRepository;
    @Mock private InterviewRepository interviewRepository;
    @Mock private EmailService emailService;
    @Mock private EmailLogService emailLogService;

    @InjectMocks private PublicMagicLinkServiceImpl service;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(service, "magicLinkTtlDays", 30L);
        ReflectionTestUtils.setField(service, "publicBaseUrl", "http://localhost:5173");
    }

    @Test
    void verifiesTokenAndReturnsCandidateApplicationStatus() {
        ApplicationEntity application = application("token-301", LocalDateTime.now().plusDays(5));
        InterviewEntity interview = InterviewEntity.builder()
                .id(700L).application(application).status("SCHEDULED")
                .interviewTime(LocalDateTime.of(2026, 10, 1, 9, 0))
                .location("Online").build();

        when(applicationRepository.findBySecureToken("token-301")).thenReturn(Optional.of(application));
        when(interviewRepository.findByApplicationIdOrderByInterviewTimeDesc(301L))
                .thenReturn(List.of(interview));

        var result = service.verify("token-301", "candidate@example.com");

        assertEquals(301L, result.getApplicationId());
        assertEquals("Tran B", result.getCandidateName());
        assertEquals("Backend Engineer", result.getJobTitle());
        assertEquals("ACTIVE", result.getApplicationStatus());
        assertEquals(1, result.getInterviews().size());
    }

    @Test
    void rejectsEmailThatDoesNotMatchTokenOwner() {
        ApplicationEntity application = application("token-301", LocalDateTime.now().plusDays(5));
        when(applicationRepository.findBySecureToken("token-301")).thenReturn(Optional.of(application));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.verify("token-301", "other@example.com"));

        assertEquals(403, exception.getStatusCode());
        assertEquals("Magic link không hợp lệ, đã hết hạn hoặc email xác minh không khớp.", exception.getMessage());
    }

    @Test
    void rejectsExpiredTokenWithoutLeakingApplicationData() {
        ApplicationEntity application = application("expired-token", LocalDateTime.now().minusMinutes(1));
        when(applicationRepository.findBySecureToken("expired-token")).thenReturn(Optional.of(application));

        CustomException exception = assertThrows(CustomException.class,
                () -> service.getStatus("expired-token", "candidate@example.com"));

        assertEquals(403, exception.getStatusCode());
    }

    @Test
    void rotatesActiveApplicationTokenAndSendsRecoveryEmail() {
        ApplicationEntity application = application("old-token", LocalDateTime.now().minusDays(2));
        when(applicationRepository.findByCompanySlugAndCandidateEmailAndStatus(
                "easytech", "candidate@example.com", "ACTIVE"))
                .thenReturn(List.of(application));
        when(applicationRepository.save(any(ApplicationEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.requestRecovery("candidate@example.com", "easytech");

        verify(applicationRepository).save(application);
        verify(emailService).sendEmail(
                eq("candidate@example.com"),
                eq("Liên kết theo dõi hồ sơ mới - EasyHire"),
                any()
        );
        org.junit.jupiter.api.Assertions.assertNotEquals("old-token", application.getSecureToken());
        org.junit.jupiter.api.Assertions.assertTrue(application.getTokenExpiryAt().isAfter(LocalDateTime.now()));
    }

    private ApplicationEntity application(String token, LocalDateTime expiry) {
        CompanyEntity company = CompanyEntity.builder().id(1L).name("EasyTech").slug("easytech").build();
        JobEntity job = JobEntity.builder().id(20L).company(company)
                .title("Backend Engineer").slug("backend-engineer").build();
        CandidateEntity candidate = CandidateEntity.builder().id(41L).company(company)
                .fullName("Tran B").email("candidate@example.com").isDeleted(false).build();
        return ApplicationEntity.builder()
                .id(301L).company(company).job(job).candidate(candidate)
                .status("ACTIVE").secureToken(token).tokenExpiryAt(expiry)
                .appliedAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now())
                .build();
    }
}
