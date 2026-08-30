package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.models.dtos.request.GoogleLoginRequestDTO;
import com.easytech.eazyhire.models.dtos.request.LoginRequestDTO;
import com.easytech.eazyhire.models.dtos.response.LoginResponseDTO;
import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.models.dtos.response.RegistrationResponseDTO;
import com.easytech.eazyhire.models.dtos.response.UserResponseDTO;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.CompanyProfileEntity;
import com.easytech.eazyhire.models.entities.UserEntity;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import com.easytech.eazyhire.models.enums.UserRole;
import com.easytech.eazyhire.models.enums.UserStatus;
import com.easytech.eazyhire.security.JwtTokenProvider;
import com.easytech.eazyhire.services.AuthService;
import com.easytech.eazyhire.services.CompanyService;
import com.easytech.eazyhire.services.EmailNotificationService;
import com.easytech.eazyhire.services.PasswordService;
import com.easytech.eazyhire.services.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private static final String GOOGLE_TOKEN_INFO_URL =
            "https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";

    private final UserService userService;
    private final CompanyService companyService;
    private final PasswordService passwordService;
    private final JwtTokenProvider tokenProvider;
    private final EmailNotificationService emailNotificationService;
    private final RestClient.Builder restClientBuilder;

    @Value("${google.client-id:}")
    private String googleClientId;

    @Override
    @Transactional
    public RegistrationResponseDTO register(RegisterRequestDTO request) {
        String email = normalizeEmail(request.getEmail());
        if (userService.existsByEmail(email)) {
            throw new CustomException(409,
                    "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");
        }

        CompanyEntity company = companyService.createPendingCompany(request);
        companyService.createInitialProfile(company, request);
        userService.createPendingHrAdministrator(request, company);
        emailNotificationService.sendRegistrationReceived(email, company.getName());
        emailNotificationService.notifyAdminOfRegistration(company.getName(), email);

        return RegistrationResponseDTO.builder()
                .email(email)
                .companyName(company.getName())
                .companyStatus(company.getStatus())
                .build();
    }

    @Override
    @Transactional
    public LoginResponseDTO login(LoginRequestDTO request) {
        UserEntity user = getUserByCredentials(request);
        if (user.getRole() != UserRole.HR && user.getRole() != UserRole.HR_ADMIN) {
            throw new CustomException(403, "Vui lòng sử dụng trang đăng nhập quản trị viên");
        }
        validateHrAccount(user);
        updateLastLogin(user);
        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponseDTO adminLogin(LoginRequestDTO request) {
        UserEntity user = getUserByCredentials(request);
        if (user.getRole() != UserRole.ADMIN) {
            throw new CustomException(403, "Bạn không có quyền truy cập trang quản trị");
        }
        validateUserStatus(user);
        updateLastLogin(user);
        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public LoginResponseDTO googleLogin(GoogleLoginRequestDTO request) {
        GoogleIdentity identity = verifyGoogleToken(request.getIdToken());
        UserEntity user = userService.findByGoogleId(identity.googleId())
                .or(() -> userService.findByEmailWithCompany(identity.email()))
                .orElseThrow(() -> new CustomException(404,
                        "Email Google chưa đăng ký doanh nghiệp. Vui lòng hoàn tất form đăng ký trước."));

        if (user.getRole() == UserRole.ADMIN) {
            throw new CustomException(403, "Tài khoản Admin không hỗ trợ đăng nhập Google");
        }
        validateHrAccount(user);
        if (user.getGoogleId() == null) user.setGoogleId(identity.googleId());
        if (user.getAvatarUrl() == null) user.setAvatarUrl(identity.picture());
        updateLastLogin(user);
        return buildLoginResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getMe(Long userId) {
        UserEntity user = userService.getByIdWithCompany(userId);
        if (user.getRole() == UserRole.ADMIN) validateUserStatus(user);
        else validateHrAccount(user);
        return mapToUserResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public LoginResponseDTO refreshToken(String refreshToken) {
        if (!tokenProvider.validateRefreshToken(refreshToken)) {
            throw new CustomException(401, "Refresh token không hợp lệ hoặc đã hết hạn");
        }
        UserEntity user = userService.getByIdWithCompany(tokenProvider.getUserIdFromToken(refreshToken));
        if (user.getRole() == UserRole.ADMIN) validateUserStatus(user);
        else validateHrAccount(user);
        return buildLoginResponse(user);
    }

    private UserEntity getUserByCredentials(LoginRequestDTO request) {
        UserEntity user = userService.findByEmailWithCompany(request.getEmail())
                .orElseThrow(this::invalidCredentials);
        if (!passwordService.matches(request.getPassword(), user.getPasswordHash())) throw invalidCredentials();
        return user;
    }

    private void validateHrAccount(UserEntity user) {
        CompanyEntity company = user.getCompany();
        if (company == null) throw new CustomException(403, "Tài khoản chưa liên kết với doanh nghiệp");
        if (company.getStatus() == CompanyStatus.PENDING || user.getStatus() == UserStatus.PENDING) {
            throw new CustomException(403,
                    "Tài khoản của bạn đang chờ phê duyệt. Vui lòng kiểm tra email để biết thêm thông tin.");
        }
        if (company.getStatus() == CompanyStatus.REJECTED) {
            throw new CustomException(403, "Hồ sơ doanh nghiệp đã bị từ chối: " + company.getRejectedReason());
        }
        if (company.getStatus() == CompanyStatus.BLOCKED) {
            throw new CustomException(403, "Tài khoản doanh nghiệp đã bị khóa. Vui lòng liên hệ quản trị viên.");
        }
        validateUserStatus(user);
    }

    private void validateUserStatus(UserEntity user) {
        if (user.getStatus() == UserStatus.INACTIVE || user.getStatus() == UserStatus.BLOCKED) {
            throw new CustomException(403,
                    "Tài khoản đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.");
        }
        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new CustomException(403, "Tài khoản chưa được kích hoạt");
        }
    }

    private GoogleIdentity verifyGoogleToken(String idToken) {
        if (googleClientId == null || googleClientId.isBlank()) {
            throw new CustomException(503, "Google OAuth chưa được cấu hình");
        }
        try {
            Map<String, Object> tokenInfo = restClientBuilder.build().get()
                    .uri(GOOGLE_TOKEN_INFO_URL, idToken)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {});
            if (tokenInfo == null
                    || !googleClientId.equals(tokenInfo.get("aud"))
                    || !isTrustedIssuer(tokenInfo.get("iss"))
                    || !Boolean.parseBoolean(String.valueOf(tokenInfo.get("email_verified")))) {
                throw new CustomException(401, "Google ID Token không hợp lệ");
            }
            String email = normalizeEmail(String.valueOf(tokenInfo.get("email")));
            return new GoogleIdentity(
                    String.valueOf(tokenInfo.get("sub")),
                    email,
                    nullableString(tokenInfo.get("picture"))
            );
        } catch (CustomException exception) {
            throw exception;
        } catch (Exception exception) {
            throw new CustomException(401, "Không thể xác thực danh tính với Google", exception);
        }
    }

    private boolean isTrustedIssuer(Object issuer) {
        String value = String.valueOf(issuer);
        return "accounts.google.com".equals(value) || "https://accounts.google.com".equals(value);
    }

    private LoginResponseDTO buildLoginResponse(UserEntity user) {
        return LoginResponseDTO.builder()
                .accessToken(tokenProvider.generateAccessToken(user))
                .refreshToken(tokenProvider.generateRefreshToken(user))
                .tokenType("Bearer")
                .expiresIn(tokenProvider.getAccessTokenExpirationMs() / 1000)
                .user(mapToUserResponseDTO(user))
                .build();
    }

    private UserResponseDTO mapToUserResponseDTO(UserEntity user) {
        CompanyEntity company = user.getCompany();
        CompanyProfileEntity profile = company == null ? null : companyService.getProfile(company.getId());
        return UserResponseDTO.builder()
                .id(user.getId()).email(user.getEmail()).fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl()).role(user.getRole()).status(user.getStatus())
                .companyId(company != null ? company.getId() : null)
                .companyName(company != null ? company.getName() : null)
                .companySlug(company != null ? company.getSlug() : null)
                .companyStatus(company != null ? company.getStatus() : null)
                .onboardingCompleted(profile != null ? profile.getOnboardingCompleted() : true)
                .profileCompleted(profile != null ? profile.getProfileCompleted() : true)
                .createdAt(user.getCreatedAt()).build();
    }

    private void updateLastLogin(UserEntity user) {
        user.setLastLoginAt(LocalDateTime.now());
        userService.save(user);
    }

    private CustomException invalidCredentials() {
        return new CustomException(401, "Email hoặc mật khẩu không chính xác.");
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }

    private String nullableString(Object value) {
        return value == null ? null : String.valueOf(value);
    }

    private record GoogleIdentity(String googleId, String email, String picture) {
    }
}
