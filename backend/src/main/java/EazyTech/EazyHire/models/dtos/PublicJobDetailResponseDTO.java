package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicJobDetailResponseDTO {
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
    private String categoryName;
    private String categorySlug;
    private LocalDateTime publishedAt;
    private LocalDate startDate;
    private LocalDate endDate;
    private PublicCompanySummaryResponseDTO company;
    private PublicApplicationFormResponseDTO applicationForm;
}
