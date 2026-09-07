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
public class CompanyProfileDTO {
    private Long id;
    private String industry;
    private String companySize;
    private String businessType;
    private String contactEmail;
    private boolean onboardingCompleted;
    private boolean profileCompleted;
    private int completedSteps;
    private String logoUrl;
    private String careerSiteLogoUrl;
    private String bannerUrl;
    private String primaryColor;
    private String description;
    private String benefits;
    private String socialLinks;
}
