package com.easytech.eazyhire.models.mappers;

import com.easytech.eazyhire.models.dtos.response.CareerSiteDTO;
import com.easytech.eazyhire.models.dtos.response.CompanyDetailResponseDTO;
import com.easytech.eazyhire.models.dtos.response.CompanyProfileDTO;
import com.easytech.eazyhire.models.dtos.response.CompanyResponseDTO;
import com.easytech.eazyhire.models.entities.CareerSiteEntity;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.CompanyProfileEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class CompanyMapper {
    public CompanyResponseDTO toResponse(CompanyEntity company) {
        return CompanyResponseDTO.builder()
                .id(company.getId()).name(company.getName()).slug(company.getSlug())
                .subdomain(company.getSubdomain()).taxCode(company.getTaxCode())
                .phone(company.getPhone()).email(company.getEmail()).website(company.getWebsite())
                .address(company.getAddress()).status(company.getStatus())
                .approvedById(company.getApprovedBy() != null ? company.getApprovedBy().getId() : null)
                .approvedByName(company.getApprovedBy() != null ? company.getApprovedBy().getFullName() : null)
                .approvedAt(company.getApprovedAt()).rejectedReason(company.getRejectedReason())
                .createdAt(company.getCreatedAt()).updatedAt(company.getUpdatedAt()).build();
    }

    public CompanyDetailResponseDTO toDetail(CompanyEntity company, CompanyProfileEntity profile,
                                              CareerSiteEntity careerSite, List<String> warnings) {
        CompanyProfileDTO profileDTO = profile == null ? null : toProfile(profile);
        CareerSiteDTO siteDTO = careerSite == null ? null : CareerSiteDTO.builder()
                .id(careerSite.getId()).siteTitle(careerSite.getSiteTitle()).tagline(careerSite.getTagline())
                .heroImageUrl(careerSite.getHeroImageUrl()).accentColor(careerSite.getAccentColor())
                .fontFamily(careerSite.getFontFamily()).showCompanyDescription(careerSite.getShowCompanyDescription())
                .showBenefits(careerSite.getShowBenefits()).footerText(careerSite.getFooterText()).build();
        return CompanyDetailResponseDTO.builder()
                .id(company.getId()).name(company.getName()).slug(company.getSlug())
                .subdomain(company.getSubdomain()).taxCode(company.getTaxCode()).phone(company.getPhone())
                .email(company.getEmail()).website(company.getWebsite()).address(company.getAddress())
                .status(company.getStatus()).approvedById(company.getApprovedBy() != null ? company.getApprovedBy().getId() : null)
                .approvedByName(company.getApprovedBy() != null ? company.getApprovedBy().getFullName() : null)
                .approvedAt(company.getApprovedAt()).rejectedReason(company.getRejectedReason())
                .profile(profileDTO).careerSite(siteDTO).duplicateWarnings(warnings)
                .createdAt(company.getCreatedAt()).updatedAt(company.getUpdatedAt()).build();
    }

    public CompanyProfileDTO toProfile(CompanyProfileEntity profile) {
        CompanyEntity company = profile.getCompany();
        return CompanyProfileDTO.builder()
                .id(profile.getId())
                .companyName(company != null ? company.getName() : null)
                .taxCode(company != null ? company.getTaxCode() : null)
                .email(company != null ? company.getEmail() : null)
                .phone(company != null ? company.getPhone() : null)
                .website(company != null ? company.getWebsite() : null)
                .address(company != null ? company.getAddress() : null)
                .logoUrl(profile.getLogoUrl()).bannerUrl(profile.getBannerUrl())
                .primaryColor(profile.getPrimaryColor()).description(profile.getDescription())
                .benefits(profile.getBenefits()).socialLinks(profile.getSocialLinks())
                .businessType(profile.getBusinessType()).industry(profile.getIndustry())
                .companySize(profile.getCompanySize()).onboardingCompleted(profile.getOnboardingCompleted())
                .profileCompleted(profile.getProfileCompleted()).build();
    }
}
