package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDetailResponseDTO {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private String requirements;
    private String benefits;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;
    private String location;
    private String workingType;
    private String employmentType;
    private String experienceLevel;
    private Integer experienceYearsMin;
    private Integer roundCount;
    private String status;
    private LocalDateTime publishedAt;
    private LocalDateTime closedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
