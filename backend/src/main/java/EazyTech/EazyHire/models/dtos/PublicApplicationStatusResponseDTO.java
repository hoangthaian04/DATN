package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicApplicationStatusResponseDTO {
    private Long applicationId;
    private String candidateName;
    private String jobTitle;
    private String companyName;
    private String applicationStatus;
    private String currentStage;
    private LocalDateTime lastUpdatedAt;
    private LocalDateTime expiresAt;
    private List<PublicInterviewSummaryDTO> interviews;
}
