package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.CvAnalysisRequestDTO;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.CandidateEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.enums.AiProviderSource;
import EazyTech.EazyHire.models.enums.CvAnalysisStatus;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.CvAnalysisRepository;
import EazyTech.EazyHire.services.AiProviderResolver;
import EazyTech.EazyHire.services.AiGenerationResult;
import EazyTech.EazyHire.services.AiTextGenerationClient;
import EazyTech.EazyHire.services.CvStorageService;
import EazyTech.EazyHire.services.CvTextExtractor;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import EazyTech.EazyHire.services.impl.CvAnalysisFailurePersistenceService;
import EazyTech.EazyHire.services.impl.CvAnalysisServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CvAnalysisServiceImplTest {

    @Mock private ApplicationRepository applicationRepository;
    @Mock private CvAnalysisRepository cvAnalysisRepository;
    @Mock private CvAnalysisFailurePersistenceService failurePersistenceService;
    @Mock private CvStorageService cvStorageService;
    @Mock private CvTextExtractor cvTextExtractor;
    @Mock private AiProviderResolver aiProviderResolver;
    @Mock private AiTextGenerationClient aiTextGenerationClient;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks private CvAnalysisServiceImpl service;

    @Test
    void scoresCvSynchronouslyAndPersistsCompletedAnalysis() {
        ApplicationEntity application = application();
        ResolvedAiProvider provider = provider();
        when(applicationRepository.findByIdAndCompanyIdWithContext(301L, 11L)).thenReturn(Optional.of(application));
        when(cvAnalysisRepository.findFirstByApplicationIdAndCompanyIdAndStatusOrderByCreatedAtDesc(301L, 11L, CvAnalysisStatus.COMPLETED))
                .thenReturn(Optional.empty());
        when(aiProviderResolver.resolve(11L)).thenReturn(provider);
        when(cvStorageService.read("private://candidate-cvs/11/20/cv.pdf")).thenReturn(new byte[]{1, 2, 3});
        when(cvTextExtractor.extract(any())).thenReturn("Java Spring Boot AWS");
        when(aiTextGenerationClient.generateJsonWithMetadata(eq(provider), any(), any())).thenReturn(
                new AiGenerationResult("""
                        {
                          "matchingScore": 85.5,
                          "matchedSkills": ["Java", "Spring Boot"],
                          "missingSkills": ["AWS"],
                          "strengths": ["Backend experience"],
                          "weaknesses": ["Limited cloud experience"],
                          "summary": "Good backend fit"
                        }
                        """, provider.model())
        );
        when(cvAnalysisRepository.save(any())).thenAnswer(invocation -> {
            var saved = invocation.<EazyTech.EazyHire.models.entities.CvAnalysisEntity>getArgument(0);
            saved.setId(701L);
            return saved;
        });

        var result = service.analyze(301L, 11L, CvAnalysisRequestDTO.builder().rerun(false).build());

        assertEquals(701L, result.getId());
        assertEquals("85.50", result.getMatchingScore().toPlainString());
        assertEquals(2, result.getMatchedSkills().size());
        assertEquals(CvAnalysisStatus.COMPLETED, result.getStatus());
        verify(failurePersistenceService, never()).saveFailure(any(), any(), any());
    }

    @Test
    void recordsFailureWhenProviderIsUnavailableAndDoesNotReturnMockScore() {
        ApplicationEntity application = application();
        when(applicationRepository.findByIdAndCompanyIdWithContext(301L, 11L)).thenReturn(Optional.of(application));
        when(cvAnalysisRepository.findFirstByApplicationIdAndCompanyIdAndStatusOrderByCreatedAtDesc(301L, 11L, CvAnalysisStatus.COMPLETED))
                .thenReturn(Optional.empty());
        when(aiProviderResolver.resolve(11L)).thenThrow(new CustomException(503, "AI provider chưa cấu hình"));

        CustomException exception = assertThrows(CustomException.class, () -> service.analyze(
                301L, 11L, CvAnalysisRequestDTO.builder().rerun(false).build()
        ));

        assertEquals(503, exception.getStatusCode());
        verify(failurePersistenceService).saveFailure(eq(application), eq(null), eq("AI provider chưa cấu hình"));
        verify(aiTextGenerationClient, never()).generateJson(any(), any(), any());
    }

    @Test
    void reusesLatestSuccessfulAnalysisUnlessRerunIsRequested() {
        ApplicationEntity application = application();
        var existing = EazyTech.EazyHire.models.entities.CvAnalysisEntity.builder()
                .id(702L).applicationId(301L).matchingScore(java.math.BigDecimal.valueOf(90))
                .providerCode("GEMINI").providerSource(AiProviderSource.SYSTEM_DEFAULT)
                .status(CvAnalysisStatus.COMPLETED).summary("Existing").build();
        when(applicationRepository.findByIdAndCompanyIdWithContext(301L, 11L)).thenReturn(Optional.of(application));
        when(cvAnalysisRepository.findFirstByApplicationIdAndCompanyIdAndStatusOrderByCreatedAtDesc(301L, 11L, CvAnalysisStatus.COMPLETED))
                .thenReturn(Optional.of(existing));

        var result = service.analyze(301L, 11L, CvAnalysisRequestDTO.builder().rerun(false).build());

        assertEquals(702L, result.getId());
        verify(aiProviderResolver, never()).resolve(any());
    }

    @Test
    void rejectsScoringForJobThatDoesNotRequireCv() {
        ApplicationEntity application = application();
        application.getJob().setRequiresCv(false);
        when(applicationRepository.findByIdAndCompanyIdWithContext(301L, 11L)).thenReturn(Optional.of(application));

        CustomException exception = assertThrows(CustomException.class, () -> service.analyze(
                301L, 11L, CvAnalysisRequestDTO.builder().rerun(false).build()
        ));

        assertEquals(422, exception.getStatusCode());
        verify(cvAnalysisRepository, never()).findFirstByApplicationIdAndCompanyIdAndStatusOrderByCreatedAtDesc(any(), any(), any());
        verify(aiProviderResolver, never()).resolve(any());
    }

    private ResolvedAiProvider provider() {
        return new ResolvedAiProvider("GEMINI", "Google Gemini", "test-key", "gemini-3-flash-preview", AiProviderSource.SYSTEM_DEFAULT);
    }

    private ApplicationEntity application() {
        CompanyEntity company = CompanyEntity.builder().id(11L).name("EasyTech").build();
        JobEntity job = JobEntity.builder().id(20L).company(company).title("Backend Engineer")
                .description("Build APIs").requirements("Java Spring Boot").benefits("Flexible").build();
        CandidateEntity candidate = CandidateEntity.builder().id(41L).company(company).fullName("Candidate").build();
        return ApplicationEntity.builder().id(301L).company(company).job(job).candidate(candidate)
                .cvUrl("private://candidate-cvs/11/20/cv.pdf").build();
    }
}
