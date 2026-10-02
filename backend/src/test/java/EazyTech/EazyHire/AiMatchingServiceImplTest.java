package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.AiMatchingContactRequestDTO;
import EazyTech.EazyHire.models.dtos.EmailLogDTO;
import EazyTech.EazyHire.models.dtos.EmailTemplateDTO;
import EazyTech.EazyHire.models.entities.AiSuggestionEntity;
import EazyTech.EazyHire.models.entities.CandidateEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.enums.AiSuggestionContactStatus;
import EazyTech.EazyHire.models.enums.EmailTemplateType;
import EazyTech.EazyHire.repositories.AiMatchingRunRepository;
import EazyTech.EazyHire.repositories.AiSuggestionRepository;
import EazyTech.EazyHire.repositories.CandidateRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AiMatchingRunQueueService;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.EmailLogService;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.services.EmailTemplateService;
import EazyTech.EazyHire.services.impl.AiMatchingServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiMatchingServiceImplTest {

    @Mock private JobRepository jobRepository;
    @Mock private CandidateRepository candidateRepository;
    @Mock private AiMatchingRunRepository runRepository;
    @Mock private AiSuggestionRepository suggestionRepository;
    @Mock private AiMatchingRunQueueService queueService;
    @Mock private EmailTemplateService emailTemplateService;
    @Mock private EmailService emailService;
    @Mock private EmailLogService emailLogService;
    @Mock private AuditService auditService;

    @InjectMocks private AiMatchingServiceImpl service;

    @Test
    void contactSendsEditableTemplateAndMarksContactedOnlyAfterSuccess() {
        JobEntity job = activeJob();
        AiSuggestionEntity suggestion = suggestion(AiSuggestionContactStatus.NOT_CONTACTED);
        CandidateEntity candidate = candidate();
        AiMatchingContactRequestDTO request = new AiMatchingContactRequestDTO();
        request.setSubject("Cơ hội Senior Java tại Công ty thử nghiệm");
        request.setBody("Xin chào An, vui lòng trao đổi thêm về Senior Java.");
        when(jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(Optional.of(job));
        when(suggestionRepository.findForContactForUpdate(50L, 10L, 20L)).thenReturn(Optional.of(suggestion));
        when(candidateRepository.findByIdAndCompanyIdAndIsDeletedFalse(30L, 20L)).thenReturn(Optional.of(candidate));
        when(emailService.sendEmail(candidate.getEmail(), request.getSubject(), request.getBody())).thenReturn(true);
        when(emailLogService.record(20L, null, candidate.getEmail(), "AI_MATCH_INVITE", request.getSubject(), request.getBody(), true))
                .thenReturn(EmailLogDTO.builder().id(99L).build());

        var result = service.contact(10L, 50L, 20L, 7L, request);

        assertEquals(AiSuggestionContactStatus.CONTACTED, result.getContactStatus());
        assertEquals(99L, result.getEmailLogId());
        assertNotNull(result.getContactedAt());
        assertEquals(AiSuggestionContactStatus.CONTACTED, suggestion.getContactStatus());
        assertNotNull(suggestion.getContactedAt());
        verify(emailService).sendEmail(candidate.getEmail(), request.getSubject(), request.getBody());
        verify(emailLogService).record(20L, null, candidate.getEmail(), "AI_MATCH_INVITE", request.getSubject(), request.getBody(), true);
        verify(suggestionRepository).save(suggestion);
        verify(auditService).recordTarget(7L, 20L, "AI_SUGGESTION", 50L, "CONTACT_AI_MATCH_CANDIDATE",
                "Đã gửi lời mời ứng tuyển tới ứng viên cho Job 10");
    }

    @Test
    void failedSmtpKeepsContactStatusAndReturnsActionableError() {
        JobEntity job = activeJob();
        AiSuggestionEntity suggestion = suggestion(AiSuggestionContactStatus.NOT_CONTACTED);
        CandidateEntity candidate = candidate();
        AiMatchingContactRequestDTO request = new AiMatchingContactRequestDTO();
        request.setSubject("Mời ứng tuyển");
        request.setBody("Nội dung mời ứng tuyển");
        when(jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(Optional.of(job));
        when(suggestionRepository.findForContactForUpdate(50L, 10L, 20L)).thenReturn(Optional.of(suggestion));
        when(candidateRepository.findByIdAndCompanyIdAndIsDeletedFalse(30L, 20L)).thenReturn(Optional.of(candidate));
        when(emailService.sendEmail(candidate.getEmail(), request.getSubject(), request.getBody())).thenReturn(false);
        when(emailLogService.record(20L, null, candidate.getEmail(), "AI_MATCH_INVITE", request.getSubject(), request.getBody(), false))
                .thenReturn(EmailLogDTO.builder().id(100L).build());

        CustomException exception = assertThrows(CustomException.class,
                () -> service.contact(10L, 50L, 20L, 7L, request));

        assertEquals(503, exception.getStatusCode());
        assertEquals(AiSuggestionContactStatus.NOT_CONTACTED, suggestion.getContactStatus());
        verify(emailLogService).record(20L, null, candidate.getEmail(), "AI_MATCH_INVITE", request.getSubject(), request.getBody(), false);
        verify(suggestionRepository, never()).save(any());
    }

    @Test
    void otherCompanyJobIsNotFoundAndNoEmailIsSent() {
        when(jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class,
                () -> service.listSuggestions(10L, 20L));

        assertEquals(404, exception.getStatusCode());
        verify(suggestionRepository, never()).findForJob(any(), any());
        verify(emailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void duplicateContactIsRejectedWithoutSendingSecondEmail() {
        when(jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(Optional.of(activeJob()));
        when(suggestionRepository.findForContactForUpdate(50L, 10L, 20L))
                .thenReturn(Optional.of(suggestion(AiSuggestionContactStatus.CONTACTED)));
        AiMatchingContactRequestDTO request = new AiMatchingContactRequestDTO();
        request.setSubject("Mời ứng tuyển");
        request.setBody("Nội dung");

        CustomException exception = assertThrows(CustomException.class,
                () -> service.contact(10L, 50L, 20L, 7L, request));

        assertEquals(409, exception.getStatusCode());
        verify(emailService, never()).sendEmail(any(), any(), any());
    }

    @Test
    void contactTemplateRendersCompanyJobAndCandidateNames() {
        JobEntity job = activeJob();
        CandidateEntity candidate = candidate();
        when(jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(Optional.of(job));
        when(suggestionRepository.findByIdAndJobIdAndCompanyId(50L, 10L, 20L))
                .thenReturn(Optional.of(suggestion(AiSuggestionContactStatus.NOT_CONTACTED)));
        when(candidateRepository.findByIdAndCompanyIdAndIsDeletedFalse(30L, 20L)).thenReturn(Optional.of(candidate));
        when(emailTemplateService.getDefaultTemplate(20L, EmailTemplateType.AI_MATCH_INVITE)).thenReturn(
                EmailTemplateDTO.builder()
                        .subject("Cơ hội {{jobTitle}} tại {{companyName}}")
                        .bodyHtml("Xin chào {{candidateName}}")
                        .build()
        );

        var result = service.getContactTemplate(10L, 50L, 20L);

        assertEquals("Cơ hội Senior Java tại EasyTech Test", result.getSubject());
        assertEquals("Xin chào An Test", result.getBody());
        assertEquals(candidate.getEmail(), result.getRecipientEmail());
    }

    private JobEntity activeJob() {
        CompanyEntity company = CompanyEntity.builder().id(20L).name("EasyTech Test").build();
        return JobEntity.builder().id(10L).company(company).title("Senior Java").status("ACTIVE").isDeleted(false).build();
    }

    private CandidateEntity candidate() {
        return CandidateEntity.builder().id(30L).company(CompanyEntity.builder().id(20L).name("EasyTech Test").build())
                .fullName("An Test").email("an@example.test").isDeleted(false).build();
    }

    private AiSuggestionEntity suggestion(AiSuggestionContactStatus status) {
        return AiSuggestionEntity.builder().id(50L).companyId(20L).jobId(10L).candidateId(30L)
                .contactStatus(status).build();
    }
}
