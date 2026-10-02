package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.entities.AiMatchingRunEntity;
import EazyTech.EazyHire.models.enums.AiMatchingRunStatus;
import EazyTech.EazyHire.models.enums.AiProviderSource;
import EazyTech.EazyHire.repositories.AiMatchingCandidateProjection;
import EazyTech.EazyHire.repositories.AiMatchingRunRepository;
import EazyTech.EazyHire.repositories.AiSuggestionRepository;
import EazyTech.EazyHire.repositories.CvAnalysisRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AiEmbeddingClient;
import EazyTech.EazyHire.services.AiMatchingRunQueueService;
import EazyTech.EazyHire.services.AiProviderResolver;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import EazyTech.EazyHire.services.impl.AiMatchingProcessor;
import EazyTech.EazyHire.models.entities.JobEntity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiMatchingProcessorTest {

    @Mock private AiMatchingRunRepository runRepository;
    @Mock private AiSuggestionRepository suggestionRepository;
    @Mock private CvAnalysisRepository cvAnalysisRepository;
    @Mock private JobRepository jobRepository;
    @Mock private AiMatchingRunQueueService queueService;
    @Mock private AiProviderResolver aiProviderResolver;
    @Mock private AiEmbeddingClient embeddingClient;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks private AiMatchingProcessor processor;

    private AiMatchingRunEntity run;
    private JobEntity job;
    private ResolvedAiProvider provider;

    @BeforeEach
    void setUp() {
        run = AiMatchingRunEntity.builder()
                .id(100L)
                .companyId(20L)
                .jobId(10L)
                .status(AiMatchingRunStatus.PROCESSING)
                .minScore(BigDecimal.valueOf(70))
                .resultLimit(2)
                .build();
        job = JobEntity.builder()
                .id(10L)
                .title("Senior Java Developer")
                .description("Build Spring Boot recruitment services")
                .requirements("Java, Spring Boot, PostgreSQL")
                .build();
        provider = new ResolvedAiProvider("GEMINI", "Google Gemini", "test-key", "gemini-2.5-flash", AiProviderSource.SYSTEM_DEFAULT);
        ReflectionTestUtils.setField(processor, "embeddingModel", "gemini-embedding-001");
        ReflectionTestUtils.setField(processor, "maxInputChars", 8000);
        ReflectionTestUtils.setField(processor, "configuredBatchSize", 32);
    }

    @Test
    void storesOnlyTopMatchesAtOrAboveThresholdAndKeepsCompanyScopedData() {
        List<AiMatchingCandidateProjection> candidates = List.of(
                candidate(101L, "[\"Java\",\"Spring Boot\"]", "[\"Microservices\"]", 1L),
                candidate(102L, "[\"PostgreSQL\"]", "[\"Backend APIs\"]", 2L),
                candidate(103L, "[\"React\"]", "[\"Frontend UI\"]", 3L)
        );
        when(runRepository.findById(100L)).thenReturn(Optional.of(run));
        when(jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(Optional.of(job));
        when(cvAnalysisRepository.findEligibleCandidatesForMatching(20L, 10L)).thenReturn(candidates);
        when(aiProviderResolver.resolve(20L)).thenReturn(provider);
        when(embeddingClient.embed(eq(provider), eq("gemini-embedding-001"), any()))
                .thenAnswer(invocation -> {
                    List<String> texts = invocation.getArgument(2);
                    if (texts.size() == 1) return List.of(List.of(1.0, 0.0));
                    return List.of(
                            List.of(0.90, Math.sqrt(1 - 0.90 * 0.90)),
                            List.of(0.80, Math.sqrt(1 - 0.80 * 0.80)),
                            List.of(0.69, Math.sqrt(1 - 0.69 * 0.69))
                    );
                });
        processor.process(100L);

        @SuppressWarnings("unchecked")
        ArgumentCaptor<List<EazyTech.EazyHire.models.entities.AiSuggestionEntity>> captor = ArgumentCaptor.forClass(List.class);
        verify(suggestionRepository).deleteByJobIdAndCompanyId(10L, 20L);
        verify(suggestionRepository).saveAll(captor.capture());
        List<EazyTech.EazyHire.models.entities.AiSuggestionEntity> saved = captor.getValue();
        assertEquals(2, saved.size());
        assertEquals(List.of(101L, 102L), saved.stream().map(EazyTech.EazyHire.models.entities.AiSuggestionEntity::getCandidateId).toList());
        assertEquals(new BigDecimal("90.00"), saved.get(0).getMatchingScore());
        assertEquals(List.of("Java", "Spring Boot"), saved.get(0).getMatchedSkills());
        assertEquals(AiMatchingRunStatus.COMPLETED, run.getStatus());
        assertEquals("gemini-embedding-001", run.getModelName());
    }

    @Test
    void successfulEmptyPoolClearsOldResultsWithoutCallingProvider() {
        when(runRepository.findById(100L)).thenReturn(Optional.of(run));
        when(jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(Optional.of(job));
        when(cvAnalysisRepository.findEligibleCandidatesForMatching(20L, 10L)).thenReturn(List.of());

        processor.process(100L);

        verify(suggestionRepository).deleteByJobIdAndCompanyId(10L, 20L);
        verify(aiProviderResolver, never()).resolve(any());
        verify(embeddingClient, never()).embed(any(), any(), any());
        assertEquals(AiMatchingRunStatus.COMPLETED, run.getStatus());
    }

    @Test
    void failedEmbeddingDoesNotDeleteExistingSuggestions() {
        when(runRepository.findById(100L)).thenReturn(Optional.of(run));
        when(jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(Optional.of(job));
        when(cvAnalysisRepository.findEligibleCandidatesForMatching(20L, 10L)).thenReturn(List.of(
                candidate(101L, "[\"Java\",\"Spring Boot\"]", "[\"Microservices\"]", 1L)
        ));
        when(aiProviderResolver.resolve(20L)).thenReturn(provider);
        when(embeddingClient.embed(eq(provider), eq("gemini-embedding-001"), anyList()))
                .thenThrow(new CustomException(503, "Gemini tạm thời không khả dụng"));

        assertThrows(CustomException.class, () -> processor.process(100L));
        verify(suggestionRepository, never()).deleteByJobIdAndCompanyId(any(), any());
    }

    private AiMatchingCandidateProjection candidate(Long id, String skills, String strength, Long applicationId) {
        return new AiMatchingCandidateProjection() {
            @Override public Long getCandidateId() { return id; }
            @Override public Long getSourceApplicationId() { return applicationId; }
            @Override public String getCandidateName() { return "Synthetic Candidate " + id; }
            @Override public String getEmail() { return "candidate" + id + "@example.test"; }
            @Override public String getSummary() { return "Professional software engineering experience"; }
            @Override public String getMatchedSkillsJson() { return skills; }
            @Override public String getStrengthsJson() { return strength; }
            @Override public LocalDateTime getRecentApplicationAt() { return LocalDateTime.of(2026, 9, 1, 12, 0); }
        };
    }
}
