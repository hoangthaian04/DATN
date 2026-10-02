package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.JobDescriptionSuggestionRequestDTO;
import EazyTech.EazyHire.models.dtos.JobDescriptionSuggestionResponseDTO;

public interface AiJobDescriptionService {

    JobDescriptionSuggestionResponseDTO suggest(
            JobDescriptionSuggestionRequestDTO request,
            Long companyId
    );
}
