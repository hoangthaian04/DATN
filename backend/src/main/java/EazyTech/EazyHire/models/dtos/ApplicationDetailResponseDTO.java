package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationDetailResponseDTO {
    private Long applicationId;
    private Long candidateId;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private Long jobId;
    private String jobTitle;
    private String location;
    private String workingType;
    private String applicationStatus; // ACTIVE, REJECTED, HIRED, NEW, IN_PROGRESS, PASSED
    private Long currentRoundId;
    private String currentRoundName;
    private Integer currentRoundOrder;
    private Integer totalRounds;
    private String cvUrl;
    private String coverLetter;
    private String source;
    private LocalDateTime appliedAt;
    private List<RoundHistoryDTO> roundHistory;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RoundHistoryDTO {
        private Long roundId;
        private String roundName;
        private Integer orderIndex;
        private Boolean isCurrent;
        private Boolean isPassed;
    }
}
