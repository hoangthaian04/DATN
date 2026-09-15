package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicCompanySummaryResponseDTO {
    private Long id;
    private String companyName;
    private String companySlug;
    private String logoUrl;
}
