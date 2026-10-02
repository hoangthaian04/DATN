package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.AiMatchingRunStatus;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Builder
public class AiMatchingRunResponseDTO {
    private Long jobId;
    private Long matchingJobId;
    private AiMatchingRunStatus status;
    private BigDecimal minScore;
    private Integer limit;
    private String errorMessage;
    private LocalDateTime createdAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;
}
