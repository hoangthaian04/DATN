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
public class CareerSiteDTO {
    private Long id;
    private String siteTitle;
    private String tagline;
    private String heroImageUrl;
    private String accentColor;
    private String fontFamily;
    private Boolean showCompanyDescription;
    private Boolean showBenefits;
    private String footerText;
}
