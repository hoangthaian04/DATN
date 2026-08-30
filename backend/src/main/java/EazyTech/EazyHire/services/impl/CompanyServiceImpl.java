package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.CareerSiteDTO;
import EazyTech.EazyHire.models.dtos.CompanyDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.CompanyFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.CompanyProfileDTO;
import EazyTech.EazyHire.models.dtos.CompanyResponseDTO;
import EazyTech.EazyHire.models.entities.CareerSiteEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.CompanyProfileEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.repositories.CareerSiteRepository;
import EazyTech.EazyHire.repositories.CompanyProfileRepository;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.services.CompanyService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final CareerSiteRepository careerSiteRepository;
    private final UserRepository userRepository;

    @Override
    public Page<CompanyResponseDTO> getCompanies(CompanyFilterRequestDTO request) {
        Page<CompanyEntity> page = companyRepository.searchCompanies(
                request.getStatus(),
                request.getSearchText(),
                request.getPageable()
        );
        return page.map(this::mapToCompanyResponseDTO);
    }

    @Override
    public CompanyDetailResponseDTO getCompanyDetail(Long id) {
        CompanyEntity company = companyRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy thông tin doanh nghiệp"));

        CompanyProfileEntity profile = companyProfileRepository.findByCompanyId(company.getId()).orElse(null);
        CareerSiteEntity careerSite = careerSiteRepository.findByCompanyId(company.getId()).orElse(null);

        return mapToCompanyDetailDTO(company, profile, careerSite);
    }

    @Override
    @Transactional
    public CompanyResponseDTO approveCompany(Long companyId, Long adminId) {
        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy doanh nghiệp"));

        UserEntity admin = userRepository.findById(adminId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy tài khoản quản trị"));

        company.setStatus(CompanyStatus.ACTIVE);
        company.setApprovedBy(admin);
        company.setApprovedAt(LocalDateTime.now());
        company.setRejectedReason(null);
        company = companyRepository.save(company);

        // Đảm bảo cấu hình Career Site mặc định tồn tại khi duyệt
        if (careerSiteRepository.findByCompanyId(company.getId()).isEmpty()) {
            CareerSiteEntity careerSite = CareerSiteEntity.builder()
                    .company(company)
                    .siteTitle("Cơ hội nghề nghiệp tại " + company.getName())
                    .tagline("Gia nhập đội ngũ tài năng của chúng tôi")
                    .accentColor("#2563eb")
                    .fontFamily("Inter")
                    .showCompanyDescription(true)
                    .showBenefits(true)
                    .build();
            careerSiteRepository.save(careerSite);
        }

        return mapToCompanyResponseDTO(company);
    }

    @Override
    @Transactional
    public CompanyResponseDTO rejectCompany(Long companyId, Long adminId, String reason) {
        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy doanh nghiệp"));

        UserEntity admin = userRepository.findById(adminId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy tài khoản quản trị"));

        company.setStatus(CompanyStatus.REJECTED);
        company.setApprovedBy(admin);
        company.setApprovedAt(LocalDateTime.now());
        company.setRejectedReason(reason != null ? reason.trim() : "Hồ sơ không đáp ứng yêu cầu");
        company = companyRepository.save(company);

        return mapToCompanyResponseDTO(company);
    }

    @Override
    @Transactional
    public CompanyResponseDTO blockCompany(Long companyId, Long adminId) {
        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy doanh nghiệp"));

        company.setStatus(CompanyStatus.BLOCKED);
        company = companyRepository.save(company);

        return mapToCompanyResponseDTO(company);
    }

    private CompanyResponseDTO mapToCompanyResponseDTO(CompanyEntity company) {
        return CompanyResponseDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .slug(company.getSlug())
                .subdomain(company.getSubdomain())
                .taxCode(company.getTaxCode())
                .phone(company.getPhone())
                .email(company.getEmail())
                .website(company.getWebsite())
                .address(company.getAddress())
                .status(company.getStatus())
                .approvedById(company.getApprovedBy() != null ? company.getApprovedBy().getId() : null)
                .approvedByName(company.getApprovedBy() != null ? company.getApprovedBy().getFullName() : null)
                .approvedAt(company.getApprovedAt())
                .rejectedReason(company.getRejectedReason())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }

    private CompanyDetailResponseDTO mapToCompanyDetailDTO(
            CompanyEntity company,
            CompanyProfileEntity profile,
            CareerSiteEntity careerSite
    ) {
        CompanyProfileDTO profileDTO = profile != null ? CompanyProfileDTO.builder()
                .id(profile.getId())
                .logoUrl(profile.getLogoUrl())
                .bannerUrl(profile.getBannerUrl())
                .primaryColor(profile.getPrimaryColor())
                .description(profile.getDescription())
                .benefits(profile.getBenefits())
                .socialLinks(profile.getSocialLinks())
                .build() : null;

        CareerSiteDTO siteDTO = careerSite != null ? CareerSiteDTO.builder()
                .id(careerSite.getId())
                .siteTitle(careerSite.getSiteTitle())
                .tagline(careerSite.getTagline())
                .heroImageUrl(careerSite.getHeroImageUrl())
                .accentColor(careerSite.getAccentColor())
                .fontFamily(careerSite.getFontFamily())
                .showCompanyDescription(careerSite.getShowCompanyDescription())
                .showBenefits(careerSite.getShowBenefits())
                .footerText(careerSite.getFooterText())
                .build() : null;

        return CompanyDetailResponseDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .slug(company.getSlug())
                .subdomain(company.getSubdomain())
                .taxCode(company.getTaxCode())
                .phone(company.getPhone())
                .email(company.getEmail())
                .website(company.getWebsite())
                .address(company.getAddress())
                .status(company.getStatus())
                .approvedById(company.getApprovedBy() != null ? company.getApprovedBy().getId() : null)
                .approvedByName(company.getApprovedBy() != null ? company.getApprovedBy().getFullName() : null)
                .approvedAt(company.getApprovedAt())
                .rejectedReason(company.getRejectedReason())
                .profile(profileDTO)
                .careerSite(siteDTO)
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }
}
