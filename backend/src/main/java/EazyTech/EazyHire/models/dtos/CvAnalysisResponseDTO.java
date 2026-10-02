package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.AiProviderSource;
import EazyTech.EazyHire.models.enums.CvAnalysisStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CvAnalysisResponseDTO {
    private Long id;
    private Long applicationId;
    private BigDecimal matchingScore;
    private List<String> matchedSkills;
    private List<String> missingSkills;
    private List<String> strengths;
    private List<String> weaknesses;
    private String summary;
    private String provider;
    private AiProviderSource providerSource;
    private CvAnalysisStatus status;
}
