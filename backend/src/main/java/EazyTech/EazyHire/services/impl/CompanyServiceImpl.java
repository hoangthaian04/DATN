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
import EazyTech.EazyHire.services.UserAccountService;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.models.dtos.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;
import EazyTech.EazyHire.services.LogoStorageService;
import EazyTech.EazyHire.core.utils.StringUtils;
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
    private final UserAccountService accounts;
    private final AuditService audit;
    private final EmailService emails;
    private final LogoStorageService logos;
    @Value("${app.admin-email:admin@easytech.vn}") private String adminEmail;

    @Override
    public Page<CompanyResponseDTO> getCompanies(CompanyFilterRequestDTO request) {
        String search = (request.getSearchText() != null && !request.getSearchText().trim().isEmpty())
                ? "%" + request.getSearchText().trim().toLowerCase() + "%"
                : null;

        Page<CompanyEntity> page = companyRepository.searchCompanies(
                request.getStatus(),
                search,
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

        UserEntity admin = accounts.requireAdmin(adminId);

        if(company.getStatus()!=CompanyStatus.PENDING && company.getStatus()!=CompanyStatus.BLOCKED) throw new CustomException(409,"Chỉ duyệt hồ sơ đang chờ duyệt hoặc mở khóa công ty.");
        accounts.activateCompanyUsers(companyId,UserStatus.ACTIVE);
        audit.record(adminId,companyId,"APPROVE_COMPANY","Phê duyệt doanh nghiệp");
        emails.sendEmail(company.getEmail(),"Doanh nghiệp đã được phê duyệt","Tài khoản của bạn đã được phê duyệt. Bạn có thể đăng nhập và thiết lập hồ sơ công ty.");
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

        UserEntity admin = accounts.requireAdmin(adminId);

        if(company.getStatus()!=CompanyStatus.PENDING) throw new CustomException(409,"Chỉ từ chối hồ sơ đang chờ duyệt.");
        if(reason==null || reason.isBlank()) throw new CustomException(400,"Vui lòng nhập lý do từ chối và hướng dẫn sửa.");
        accounts.activateCompanyUsers(companyId,UserStatus.PENDING);
        audit.record(adminId,companyId,"REJECT_COMPANY",reason);
        emails.sendEmail(company.getEmail(),"Hồ sơ cần chỉnh sửa",reason+"\nĐăng nhập, mở trang /registration/rejected và chọn Chỉnh sửa & gửi lại.");
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

        accounts.requireAdmin(adminId);
        if(company.getStatus()!=CompanyStatus.ACTIVE) throw new CustomException(409,"Chỉ khóa doanh nghiệp đang hoạt động.");
        audit.record(adminId,companyId,"BLOCK_COMPANY","Khóa quyền truy cập workspace");
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

    public CompanyDetailResponseDTO mapToCompanyDetailDTO(
            CompanyEntity company,
            CompanyProfileEntity profile,
            CareerSiteEntity careerSite
    ) {
        CompanyProfileDTO profileDTO = profile != null ? CompanyProfileDTO.builder()
                .id(profile.getId())
                .industry(profile.getIndustry()).companySize(profile.getCompanySize())
                .businessType(profile.getBusinessType()).contactEmail(profile.getContactEmail())
                .onboardingCompleted(Boolean.TRUE.equals(profile.getOnboardingCompleted()))
                .profileCompleted(completedSteps(company,profile)==3)
                .completedSteps(completedSteps(company,profile))
                .logoUrl(careerSite != null ? careerSite.getLogoUrl() : null)
                .careerSiteLogoUrl(careerSite != null ? careerSite.getLogoUrl() : null)
                .bannerUrl(profile.getBannerUrl())
                .primaryColor(profile.getPrimaryColor())
                .description(profile.getDescription())
                .benefits(profile.getBenefits())
                .socialLinks(profile.getSocialLinks())
                .build() : null;

        CareerSiteDTO siteDTO = careerSite != null ? CareerSiteDTO.builder()
                .id(careerSite.getId()).logoUrl(careerSite.getLogoUrl())
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
                .duplicateWarnings(java.util.List.of())
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }

    @Transactional public CompanyResponseDTO changeStatus(Long id,Long adminId,CompanyStatusRequestDTO request){
      return switch(request.getStatus()){
       case ACTIVE -> approveCompany(id,adminId);
       case REJECTED -> rejectCompany(id,adminId,request.getReason());
       case BLOCKED -> blockCompany(id,adminId);
       default -> throw new CustomException(400,"Trạng thái yêu cầu không hợp lệ.");
      };
    }
    private boolean filled(String value){return value!=null && !value.isBlank();}
    public int completedSteps(CompanyEntity company,CompanyProfileEntity profile){
      if(profile==null)return 0;
      int count=0;
      if(filled(profile.getIndustry()) && filled(profile.getCompanySize()) && filled(profile.getDescription()))count++;
      // Logo is optional; the default branding satisfies step two.
      count++;
      if(filled(profile.getContactEmail()) && filled(company.getAddress()))count++;
      return count;
    }
    public CompanyDetailResponseDTO getMyCompany(Long userId){
      return getCompanyDetail(accounts.requireHr(userId,false).getCompany().getId());
    }
    @Transactional public CompanyDetailResponseDTO updateProfile(Long userId,OnboardingRequestDTO request){
      CompanyEntity company=accounts.requireHr(userId,true).getCompany();
      CompanyProfileEntity p=companyProfileRepository.findByCompanyId(company.getId()).orElseThrow(()->new CustomException(404,"Không tìm thấy hồ sơ công ty."));
      if(request.getPhone()!=null)company.setPhone(request.getPhone());
      if(request.getAddress()!=null)company.setAddress(request.getAddress());
      if(request.getWebsite()!=null)company.setWebsite(request.getWebsite());
      if(request.getIndustry()!=null)p.setIndustry(request.getIndustry());
      if(request.getCompanySize()!=null)p.setCompanySize(request.getCompanySize());
      if(request.getDescription()!=null)p.setDescription(request.getDescription());
      if(request.getBenefits()!=null)p.setBenefits(request.getBenefits());
      if(request.getBusinessType()!=null)p.setBusinessType(request.getBusinessType());
      if(request.getContactEmail()!=null)p.setContactEmail(request.getContactEmail());
      if(request.getPrimaryColor()!=null)p.setPrimaryColor(request.getPrimaryColor());
      if(Boolean.TRUE.equals(request.getOnboardingCompleted()))p.setOnboardingCompleted(true);
      companyRepository.save(company);companyProfileRepository.save(p);
      return getCompanyDetail(company.getId());
    }
    @Transactional public CompanyDetailResponseDTO uploadLogo(Long userId,MultipartFile file){
      CompanyEntity company=accounts.requireHr(userId,true).getCompany();
      CareerSiteEntity site=careerSiteRepository.findByCompanyId(company.getId()).orElseThrow(()->new CustomException(404,"Không tìm thấy cấu hình Career Site."));
      site.setLogoUrl(logos.storeLogo(company.getId(),file));careerSiteRepository.save(site);
      return getCompanyDetail(company.getId());
    }
    public void validateUnique(String taxCode,String subdomain,Long id){
      if(companyRepository.existsByTaxCodeAndIdNot(taxCode,id))throw new CustomException(409,"Mã số thuế này đã được đăng ký. Vui lòng liên hệ hỗ trợ nếu có nhầm lẫn.");
      if(subdomain!=null && companyRepository.existsBySubdomainAndIdNot(subdomain,id))throw new CustomException(409,"Subdomain này đã được sử dụng. Vui lòng chọn một subdomain khác.");
    }
    @Transactional public CompanyEntity createRegistration(RegisterRequestDTO request){
      validateUnique(request.getTaxCode(),request.getSubdomain(),0L);
      String base=StringUtils.toSlug(request.getCompanyName());if(base.isBlank())base="company";
      String slug=base;int suffix=1;while(companyRepository.existsBySlug(slug))slug=base+"-"+suffix++;
      CompanyEntity company=CompanyEntity.builder().name(request.getCompanyName().trim()).slug(slug)
        .subdomain(request.getSubdomain()).taxCode(request.getTaxCode()).phone(request.getPhone())
        .address(request.getAddress()).email(request.getEmail().trim().toLowerCase()).website(request.getWebsite())
        .status(CompanyStatus.PENDING).build();
      company=companyRepository.save(company);
      companyProfileRepository.save(CompanyProfileEntity.builder().company(company)
        .industry(request.getIndustry()).companySize(request.getCompanySize()).description(request.getDescription())
        .contactEmail(company.getEmail()).build());
      careerSiteRepository.save(CareerSiteEntity.builder().company(company).logoUrl(request.getLogoUrl())
        .siteTitle("Cơ hội nghề nghiệp tại "+company.getName()).build());
      emails.sendEmail(company.getEmail(),"Đã tiếp nhận hồ sơ","Hồ sơ của bạn đang chờ Admin phê duyệt.");
      emails.sendEmail(adminEmail,"Doanh nghiệp đăng ký mới",company.getName()+" - "+company.getTaxCode());
      return company;
    }
    @Transactional public CompanyDetailResponseDTO resubmit(Long userId,RegistrationUpdateRequestDTO request){
      CompanyEntity company=accounts.requireHr(userId,false).getCompany();
      if(company.getStatus()!=CompanyStatus.REJECTED)throw new CustomException(409,"Chỉ gửi lại hồ sơ đã bị từ chối.");
      String reason=company.getRejectedReason()==null?"":company.getRejectedReason().toLowerCase();
      if(!java.util.Objects.equals(company.getTaxCode(),request.getTaxCode()) &&
          !(reason.contains("thuế") || reason.contains("mst") || reason.contains("tax")))
        throw new CustomException(400,"Chỉ sửa mã số thuế khi lý do từ chối yêu cầu sửa mã số thuế.");
      validateUnique(request.getTaxCode(),request.getSubdomain(),company.getId());
      company.setName(request.getCompanyName());company.setTaxCode(request.getTaxCode());
      company.setPhone(request.getPhone());company.setAddress(request.getAddress());company.setSubdomain(request.getSubdomain());
      company.setStatus(CompanyStatus.PENDING);company.setRejectedReason(null);company.setApprovedAt(null);company.setApprovedBy(null);
      accounts.activateCompanyUsers(company.getId(),UserStatus.PENDING);
      companyRepository.save(company);audit.record(userId,company.getId(),"RESUBMIT_COMPANY","Gửi lại hồ sơ");
      emails.sendEmail(adminEmail,"Hồ sơ doanh nghiệp gửi lại",company.getName());
      return getCompanyDetail(company.getId());
    }

}
