package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.AiProviderSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionSuggestionResponseDTO {
    private String suggestedDescription;
    private String suggestedRequirements;
    private String suggestedBenefits;
    private String provider;
    private AiProviderSource providerSource;
    private String model;
}
