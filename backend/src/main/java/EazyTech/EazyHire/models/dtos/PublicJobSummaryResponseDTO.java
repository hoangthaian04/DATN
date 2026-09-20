package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicJobSummaryResponseDTO {
    private Long id;
    private String title;
    private String slug;
    private String location;
    private String workingType;
    private String employmentType;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;
    private String categoryName;
    private String categorySlug;
    private LocalDateTime publishedAt;
}
