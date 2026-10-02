package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.AiSuggestionContactStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AiSuggestionResponseDTO {
    private Long suggestionId;
    private Long candidateId;
    private String candidateName;
    private String email;
    private BigDecimal matchingScore;
    private List<String> matchedSkills;
    private List<String> strengths;
    private AiSuggestionContactStatus contactStatus;
    private LocalDateTime contactedAt;
    private LocalDateTime recentApplicationAt;
    private LocalDateTime createdAt;
}
