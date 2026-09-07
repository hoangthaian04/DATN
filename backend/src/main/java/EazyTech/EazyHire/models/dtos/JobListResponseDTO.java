package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobListResponseDTO {
    private Long id;
    private String title;
    private String location;
    private String jobType;
    private String status;
    private Long applicantCount;
    private LocalDateTime publishedAt;
    private LocalDateTime createdAt;
}
