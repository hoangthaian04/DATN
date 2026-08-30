package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.StringUtils;
import EazyTech.EazyHire.models.dtos.CareerSiteDTO;
import EazyTech.EazyHire.models.dtos.CompanyDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.CompanyProfileDTO;
import EazyTech.EazyHire.models.dtos.GoogleLoginRequestDTO;
import EazyTech.EazyHire.models.dtos.LoginRequestDTO;
import EazyTech.EazyHire.models.dtos.LoginResponseDTO;
import EazyTech.EazyHire.models.dtos.OnboardingRequestDTO;
import EazyTech.EazyHire.models.dtos.RegisterRequestDTO;
import EazyTech.EazyHire.models.dtos.UserResponseDTO;
import EazyTech.EazyHire.models.entities.CareerSiteEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.CompanyProfileEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.repositories.CareerSiteRepository;
import EazyTech.EazyHire.repositories.CompanyProfileRepository;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.security.JwtTokenProvider;
import EazyTech.EazyHire.services.AuthService;
import EazyTech.EazyHire.services.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final CareerSiteRepository careerSiteRepository;
    private final PasswordService passwordService;
    private final JwtTokenProvider tokenProvider;

    @Override
    @Transactional
    public LoginResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new CustomException(400, "Email đã tồn tại trên hệ thống");
        }

        // Tạo slug công ty từ tên
        String baseSlug = StringUtils.toSlug(request.getCompanyName());
        String slug = baseSlug;
        int count = 1;
        while (companyRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }

        // 1. Tạo Company với trạng thái PENDING
        CompanyEntity company = CompanyEntity.builder()
                .name(request.getCompanyName().trim())
                .slug(slug)
                .phone(request.getPhone())
                .email(request.getEmail().trim().toLowerCase())
                .status(CompanyStatus.PENDING)
                .build();
        company = companyRepository.save(company);

        // 2. Tạo Profile & CareerSite mặc định
        CompanyProfileEntity profile = CompanyProfileEntity.builder()
                .company(company)
                .primaryColor("#2563eb")
                .build();
        companyProfileRepository.save(profile);

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

        // 3. Tạo User HR
        UserEntity user = UserEntity.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .passwordHash(passwordService.encode(request.getPassword()))
                .role(UserRole.HR)
                .status(UserStatus.ACTIVE)
                .company(company)
                .build();
        user = userRepository.save(user);

        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        UserEntity user = userRepository.findByEmailWithCompany(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new CustomException(401, "Email hoặc mật khẩu không chính xác"));

        if (!passwordService.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException(401, "Email hoặc mật khẩu không chính xác");
        }

        if (user.getRole() != UserRole.HR) {
            throw new CustomException(403, "Vui lòng sử dụng trang đăng nhập quản trị viên");
        }

        if (user.getStatus() == UserStatus.BLOCKED || user.getStatus() == UserStatus.INACTIVE) {
            throw new CustomException(403, "Tài khoản của bạn đã bị khóa hoặc ngừng kích hoạt");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponseDTO adminLogin(LoginRequestDTO request) {
        UserEntity user = userRepository.findByEmailWithCompany(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new CustomException(401, "Email hoặc mật khẩu không chính xác"));

        if (!passwordService.matches(request.getPassword(), user.getPasswordHash())) {
            throw new CustomException(401, "Email hoặc mật khẩu không chính xác");
        }

        if (user.getRole() != UserRole.ADMIN) {
            throw new CustomException(403, "Bạn không có quyền truy cập trang quản trị");
        }

        if (user.getStatus() == UserStatus.BLOCKED || user.getStatus() == UserStatus.INACTIVE) {
            throw new CustomException(403, "Tài khoản quản trị của bạn đã bị khóa");
        }

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponseDTO googleLogin(GoogleLoginRequestDTO request) {
        String idToken = request.getIdToken();
        if (idToken == null || idToken.isBlank()) {
            throw new CustomException(400, "Google ID Token không được để trống");
        }

        // 1. Xác thực Google ID Token qua Google OAuth2 API
        String googleId;
        String email;
        String name;
        String picture;

        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String googleTokenUrl = "https://oauth2.googleapis.com/tokeninfo?id_token=" + idToken;
            @SuppressWarnings("unchecked")
            java.util.Map<String, Object> tokenInfo = restTemplate.getForObject(googleTokenUrl, java.util.Map.class);

            if (tokenInfo == null || tokenInfo.get("email") == null) {
                throw new CustomException(401, "Google ID Token không hợp lệ");
            }

            email = ((String) tokenInfo.get("email")).trim().toLowerCase();
            googleId = (String) tokenInfo.get("sub");
            name = (String) tokenInfo.get("name");
            picture = (String) tokenInfo.get("picture");
            if (name == null || name.isBlank()) {
                name = email.split("@")[0];
            }
        } catch (CustomException ce) {
            throw ce;
        } catch (Exception e) {
            throw new CustomException(401, "Không thể xác thực danh tính với Google: " + e.getMessage());
        }

        // 2. Kiểm tra người dùng trong hệ thống
        UserEntity user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmailWithCompany(email))
                .orElse(null);

        if (user != null) {
            // Cập nhật googleId hoặc avatar nếu chưa có
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
            }
            if (user.getAvatarUrl() == null && picture != null) {
                user.setAvatarUrl(picture);
            }
            if (user.getStatus() == UserStatus.BLOCKED || user.getStatus() == UserStatus.INACTIVE) {
                throw new CustomException(403, "Tài khoản của bạn đã bị khóa hoặc ngừng kích hoạt");
            }
            user.setLastLoginAt(LocalDateTime.now());
            user = userRepository.save(user);
            return buildLoginResponse(user);
        }

        // 3. Nếu là người dùng mới: Tự động khởi tạo Doanh nghiệp & Hồ sơ HR
        String companyName = name + "'s Company";
        String baseSlug = StringUtils.toSlug(companyName);
        String slug = baseSlug;
        int count = 1;
        while (companyRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + count++;
        }

        // Tạo Company trạng thái PENDING
        CompanyEntity company = CompanyEntity.builder()
                .name(companyName)
                .slug(slug)
                .email(email)
                .status(CompanyStatus.PENDING)
                .build();
        company = companyRepository.save(company);

        // Tạo Profile & CareerSite mặc định
        CompanyProfileEntity profile = CompanyProfileEntity.builder()
                .company(company)
                .logoUrl(picture)
                .primaryColor("#2563eb")
                .build();
        companyProfileRepository.save(profile);

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

        // Tạo User HR
        user = UserEntity.builder()
                .email(email)
                .fullName(name)
                .googleId(googleId)
                .avatarUrl(picture)
                .role(UserRole.HR)
                .status(UserStatus.ACTIVE)
                .company(company)
                .build();
        user = userRepository.save(user);

        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public CompanyDetailResponseDTO onboarding(Long userId, OnboardingRequestDTO request) {
        UserEntity user = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));

        CompanyEntity company = user.getCompany();
        if (company == null) {
            throw new CustomException(400, "Người dùng chưa liên kết với doanh nghiệp");
        }

        // Cập nhật thông tin doanh nghiệp
        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            company.setName(request.getCompanyName().trim());
        }
        company.setTaxCode(request.getTaxCode());
        company.setPhone(request.getPhone());
        company.setEmail(request.getEmail());
        company.setWebsite(request.getWebsite());
        company.setAddress(request.getAddress());
        company.setStatus(CompanyStatus.PENDING); // Đặt về PENDING để chờ duyệt
        company = companyRepository.save(company);

        final CompanyEntity targetCompany = company;
        CompanyProfileEntity profile = companyProfileRepository.findByCompanyId(targetCompany.getId())
                .orElseGet(() -> CompanyProfileEntity.builder().company(targetCompany).build());

        if (request.getLogoUrl() != null) profile.setLogoUrl(request.getLogoUrl());
        if (request.getBannerUrl() != null) profile.setBannerUrl(request.getBannerUrl());
        if (request.getPrimaryColor() != null) profile.setPrimaryColor(request.getPrimaryColor());
        if (request.getDescription() != null) profile.setDescription(request.getDescription());
        if (request.getBenefits() != null) profile.setBenefits(request.getBenefits());
        profile = companyProfileRepository.save(profile);

        CareerSiteEntity careerSite = careerSiteRepository.findByCompanyId(company.getId()).orElse(null);

        return mapToCompanyDetailDTO(company, profile, careerSite);
    }

    @Override
    public UserResponseDTO getMe(Long userId) {
        UserEntity user = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));

        return mapToUserResponseDTO(user);
    }

    @Override
    public LoginResponseDTO refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken)) {
            throw new CustomException(401, "Refresh token không hợp lệ hoặc đã hết hạn");
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        UserEntity user = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new CustomException(403, "Tài khoản của bạn không hoạt động");
        }

        return buildLoginResponse(user);
    }

    private LoginResponseDTO buildLoginResponse(UserEntity user) {
        String accessToken = tokenProvider.generateAccessToken(user);
        String refreshToken = tokenProvider.generateRefreshToken(user);

        return LoginResponseDTO.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(mapToUserResponseDTO(user))
                .build();
    }

    private UserResponseDTO mapToUserResponseDTO(UserEntity user) {
        CompanyEntity company = user.getCompany();
        return UserResponseDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .companyId(company != null ? company.getId() : null)
                .companyName(company != null ? company.getName() : null)
                .companySlug(company != null ? company.getSlug() : null)
                .companyStatus(company != null ? company.getStatus() : null)
                .createdAt(user.getCreatedAt())
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
