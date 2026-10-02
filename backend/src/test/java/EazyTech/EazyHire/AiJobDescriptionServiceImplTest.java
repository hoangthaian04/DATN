package EazyTech.EazyHire;

import EazyTech.EazyHire.models.dtos.JobDescriptionSuggestionRequestDTO;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.enums.AiProviderSource;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import EazyTech.EazyHire.repositories.JobCategoryRepository;
import EazyTech.EazyHire.services.AiGenerationResult;
import EazyTech.EazyHire.services.AiProviderResolver;
import EazyTech.EazyHire.services.AiTextGenerationClient;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import EazyTech.EazyHire.services.impl.AiJobDescriptionServiceImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AiJobDescriptionServiceImplTest {

    @Mock private JobCategoryRepository jobCategoryRepository;
    @Mock private AiProviderResolver aiProviderResolver;
    @Mock private AiTextGenerationClient aiTextGenerationClient;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();
    @InjectMocks private AiJobDescriptionServiceImpl service;

    @Test
    void createsStatelessSuggestionWithoutJobWrite() {
        when(jobCategoryRepository.findByIdAndStatusAndIsDeletedFalse(7L, JobCategoryStatus.ACTIVE))
                .thenReturn(Optional.of(JobCategoryEntity.builder().id(7L).name("Engineering").build()));
        when(aiProviderResolver.resolve(11L)).thenReturn(new ResolvedAiProvider(
                "GEMINI", "Google Gemini", "test-key", "gemini-3-flash-preview", AiProviderSource.SYSTEM_DEFAULT
        ));
        when(aiTextGenerationClient.generateJsonWithMetadata(eq(new ResolvedAiProvider(
                "GEMINI", "Google Gemini", "test-key", "gemini-3-flash-preview", AiProviderSource.SYSTEM_DEFAULT
        )), any(), any())).thenReturn(new AiGenerationResult(
                new ObjectMapper().createObjectNode()
                        .put("suggestedDescription", "Build products")
                        .put("suggestedRequirements", "Java and Spring Boot")
                        .put("suggestedBenefits", "Flexible work")
                        .toString(),
                "gemini-3-flash-preview"
        ));

        var result = service.suggest(JobDescriptionSuggestionRequestDTO.builder()
                .title("Senior Backend Engineer")
                .categoryId(7L)
                .experienceLevel("SENIOR")
                .workingType("HYBRID")
                .prompt("Nhấn mạnh Spring Boot")
                .build(), 11L);

        assertEquals("Build products", result.getSuggestedDescription());
        assertEquals("GEMINI", result.getProvider());
        assertEquals(AiProviderSource.SYSTEM_DEFAULT, result.getProviderSource());
        verify(aiProviderResolver).resolve(11L);
        verify(aiTextGenerationClient).generateJsonWithMetadata(any(), any(), any());
    }
}
