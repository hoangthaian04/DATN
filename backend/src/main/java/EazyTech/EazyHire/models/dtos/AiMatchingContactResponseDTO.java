package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.AiSuggestionContactStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AiMatchingContactResponseDTO {
    private Long suggestionId;
    private Long emailLogId;
    private AiSuggestionContactStatus contactStatus;
    private LocalDateTime contactedAt;
}
