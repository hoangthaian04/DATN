package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplicationListResponseDTO {
    private Long applicationId;
    private Long candidateId;
    private String fullName;
    private String jobTitle;
    private String phone;
    private String email;
    private String applicationStatus; // ACTIVE, REJECTED, HIRED
    private Long currentRoundId;
    private LocalDateTime appliedAt;
}
