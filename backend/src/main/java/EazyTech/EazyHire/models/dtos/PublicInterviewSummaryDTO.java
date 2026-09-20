package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicInterviewSummaryDTO {
    private Long id;
    private String status;
    private LocalDateTime interviewTime;
    private Integer duration;
    private String location;
    private String candidateNote;
    private LocalDateTime rescheduleTime;
    private String rescheduleReason;
}
