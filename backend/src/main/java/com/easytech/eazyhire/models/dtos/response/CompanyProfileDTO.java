package com.easytech.eazyhire.models.dtos.response;

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
    private String logoUrl;
    private String bannerUrl;
    private String primaryColor;
    private String description;
    private String benefits;
    private String socialLinks;
    private String businessType;
    private String industry;
    private String companySize;
    private Boolean onboardingCompleted;
    private Boolean profileCompleted;
}
