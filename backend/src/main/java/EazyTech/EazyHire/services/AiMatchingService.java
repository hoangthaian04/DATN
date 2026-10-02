package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.AiMatchingContactRequestDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingContactResponseDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingContactTemplateDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingRunResponseDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingTriggerRequestDTO;
import EazyTech.EazyHire.models.dtos.AiSuggestionResponseDTO;

import java.util.List;

public interface AiMatchingService {
    void enqueueForPublishedJob(Long jobId, Long companyId, Long userId);

    AiMatchingRunResponseDTO trigger(Long jobId, Long companyId, Long userId, AiMatchingTriggerRequestDTO request);

    AiMatchingRunResponseDTO getLatestRun(Long jobId, Long companyId);

    List<AiSuggestionResponseDTO> listSuggestions(Long jobId, Long companyId);

    AiMatchingContactTemplateDTO getContactTemplate(Long jobId, Long suggestionId, Long companyId);

    AiMatchingContactResponseDTO contact(Long jobId, Long suggestionId, Long companyId, Long userId,
                                         AiMatchingContactRequestDTO request);
}
