package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobCategoryResponseDTO {
    private Long id;
    private String name;
    private String slug;
    private Integer sortOrder;
    private JobCategoryStatus status;
    private long jobCount;
    private LocalDateTime createdAt;
}
