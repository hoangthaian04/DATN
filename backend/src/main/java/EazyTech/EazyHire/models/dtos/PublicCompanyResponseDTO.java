package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PublicCompanyResponseDTO {
    private Long id;
    private String companyName;
    private String companySlug;
    private String logoUrl;
    private String bannerUrl;
    private String siteTitle;
    private String tagline;
    private String description;
    private String website;
    private String publicEmail;
    private String publicPhone;
    private String primaryColor;
    private String accentColor;
    private List<PublicCategoryOptionResponseDTO> categories;
}
