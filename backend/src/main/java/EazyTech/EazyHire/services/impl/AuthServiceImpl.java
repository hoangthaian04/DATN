package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.StringUtils;
import EazyTech.EazyHire.models.dtos.CareerSiteDTO;
import EazyTech.EazyHire.models.dtos.CompanyDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.CompanyProfileDTO;
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
import EazyTech.EazyHire.core.RedisClient;
import EazyTech.EazyHire.services.AuthService;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.services.PasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.security.SecureRandom;
import EazyTech.EazyHire.services.CompanyService;
import EazyTech.EazyHire.services.UserAccountService;
import EazyTech.EazyHire.services.AuditService;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordService passwordService;
    private final JwtTokenProvider tokenProvider;
    private final RedisClient redisClient;
    private final EmailService emailService;
    private final CompanyService companies;
    private final UserAccountService accounts;
    private final AuditService audit;

    @Override
    @Transactional
    public LoginResponseDTO register(RegisterRequestDTO request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new CustomException(409, "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.");
        }

        CompanyEntity company = companies.createRegistration(request);

        // Tài khoản đăng ký chỉ có quyền xem và gửi lại hồ sơ.
        UserEntity user = UserEntity.builder()
                .email(request.getEmail().trim().toLowerCase())
                .fullName(request.getFullName().trim())
                .passwordHash(passwordService.encode(request.getPassword()))
                .role(UserRole.HR_ADMIN)
                .status(UserStatus.PENDING)
                .company(company)
                .build();
        user = userRepository.save(user);

        audit.record(user.getId(),user.getCompany()==null?null:user.getCompany().getId(),"AUTH_SESSION","Tạo phiên đăng nhập");
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

        if (user.getRole() != UserRole.HR && user.getRole() != UserRole.HR_ADMIN) {
            throw new CustomException(403, "Vui lòng sử dụng trang đăng nhập quản trị viên");
        }

        accounts.requireAllowed(user);

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        audit.record(user.getId(),user.getCompany()==null?null:user.getCompany().getId(),"AUTH_SESSION","Tạo phiên đăng nhập");
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

        if (user.getRole() != UserRole.ADMIN || user.getStatus() != UserStatus.ACTIVE) {
            throw new CustomException(403, "Bạn không có quyền truy cập trang quản trị");
        }

        accounts.requireAllowed(user);

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        audit.record(user.getId(),user.getCompany()==null?null:user.getCompany().getId(),"AUTH_SESSION","Tạo phiên đăng nhập");
        return buildLoginResponse(user);
    }

    @Override
    @Transactional
    public CompanyDetailResponseDTO onboarding(Long userId, OnboardingRequestDTO request) {
        return companies.updateProfile(userId,request);
    }

    @Override
    public UserResponseDTO getMe(Long userId) {
        UserEntity user = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));

        accounts.requireAllowed(user);
        return mapToUserResponseDTO(user);
    }

    @Override
    public LoginResponseDTO refreshToken(String refreshToken) {
        if (!tokenProvider.validateToken(refreshToken) || !tokenProvider.isTokenType(refreshToken,"REFRESH")) {
            throw new CustomException(401, "Refresh token không hợp lệ hoặc đã hết hạn");
        }

        Long userId = tokenProvider.getUserIdFromToken(refreshToken);
        UserEntity user = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));

        accounts.requireAllowed(user);

        Integer tokenVersion = tokenProvider.getTokenVersionFromToken(refreshToken);
        if (!user.getTokenVersion().equals(tokenVersion)) {
            throw new CustomException(401, "Phiên đăng nhập đã hết hạn do mật khẩu thay đổi. Vui lòng đăng nhập lại.");
        }

        audit.record(user.getId(),user.getCompany()==null?null:user.getCompany().getId(),"AUTH_SESSION","Tạo phiên đăng nhập");
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

    @Override
    public void forgotPassword(String email) {
        UserEntity user = userRepository.findByEmailWithCompany(email.trim().toLowerCase())
                .orElse(null);
        if (user == null || user.getRole()==UserRole.ADMIN) {
            return; 
        }

        if(!redisClient.putIfAbsent("OTP_COOLDOWN_"+user.getEmail(),"1",60))throw new CustomException(429,"Vui lòng đợi 60 giây trước khi gửi lại OTP.");
        redisClient.delete("OTP_ATTEMPTS_"+user.getEmail());
        String otp = String.format("%06d", new SecureRandom().nextInt(1000000));
        redisClient.set("OTP_FORGOT_PW_" + user.getEmail(), passwordService.encode(otp), 600);

        String emailContent = "Mã OTP để khôi phục mật khẩu của bạn là: " + otp + "\nMã này sẽ hết hạn trong 10 phút.";
        emailService.sendEmail(user.getEmail(), "Khôi phục mật khẩu - EazyHire", emailContent);
    }

    @Override
    public String verifyOtp(String email, String otp) {
        email=email.trim().toLowerCase();
        long attempts=redisClient.incrementWithExpiry("OTP_ATTEMPTS_"+email,600);
        if(attempts>5){redisClient.delete("OTP_FORGOT_PW_"+email);throw new CustomException(429,"Quá số lần thử. Vui lòng gửi lại OTP.");}
        String cachedOtp = redisClient.get("OTP_FORGOT_PW_" + email);
        if (cachedOtp == null || !passwordService.matches(otp,cachedOtp)) {
            throw new CustomException(400, "Mã OTP không hợp lệ hoặc đã hết hạn");
        }

        UserEntity user = userRepository.findByEmailWithCompany(email.trim().toLowerCase())
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));

        if(!redisClient.consumeIfEqual("OTP_FORGOT_PW_"+email,cachedOtp))throw new CustomException(400,"OTP đã được sử dụng.");
        String resetToken = UUID.randomUUID().toString();
        redisClient.set("RESET_PW_TOKEN_" + resetToken, user.getEmail()+"|"+user.getTokenVersion(), 900);


        return resetToken;
    }

    @Override
    @Transactional
    public void resetPassword(String resetToken, String newPassword, String confirmPassword) {
        if(!newPassword.equals(confirmPassword))throw new CustomException(400,"Mật khẩu xác nhận không khớp.");
        String payload = redisClient.get("RESET_PW_TOKEN_" + resetToken);
        String email=payload==null?null:payload.split("\\|")[0];
        if (email == null) {
            throw new CustomException(400, "Token khôi phục mật khẩu không hợp lệ hoặc đã hết hạn");
        }

        UserEntity user = userRepository.findByEmailWithCompany(email)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));

        if(!payload.equals(user.getEmail()+"|"+user.getTokenVersion()))throw new CustomException(400,"Reset token đã hết hiệu lực. Vui lòng yêu cầu OTP mới.");
        if(passwordService.matches(newPassword,user.getPasswordHash()))throw new CustomException(400,"Mật khẩu mới không được trùng mật khẩu hiện tại.");
        if(!redisClient.consumeIfEqual("RESET_PW_TOKEN_"+resetToken,payload))throw new CustomException(400,"Reset token đã được sử dụng.");
        user.setPasswordHash(passwordService.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);


    }

    @Override
    @Transactional
    public LoginResponseDTO changePassword(Long userId, String currentPassword, String newPassword, String confirmPassword) {
        if(!newPassword.equals(confirmPassword))throw new CustomException(400,"Mật khẩu xác nhận không khớp.");
        UserEntity user = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));

        accounts.requireHr(userId,false);
        if (!passwordService.matches(currentPassword, user.getPasswordHash())) {
            throw new CustomException(400, "Mật khẩu hiện tại không chính xác");
        }

        if (passwordService.matches(newPassword, user.getPasswordHash())) {
            throw new CustomException(400, "Mật khẩu mới không được trùng với mật khẩu hiện tại");
        }

        user.setPasswordHash(passwordService.encode(newPassword));
        user.setTokenVersion(user.getTokenVersion() + 1);
        userRepository.save(user);
        audit.record(user.getId(),user.getCompany()==null?null:user.getCompany().getId(),"AUTH_SESSION","Tạo phiên đăng nhập");
        return buildLoginResponse(user);
    }

    private UserResponseDTO mapToUserResponseDTO(UserEntity user) {
        CompanyEntity company = user.getCompany();
        CompanyDetailResponseDTO detail=company==null?null:companies.getCompanyDetail(company.getId());
        return UserResponseDTO.builder()
                .onboardingCompleted(detail!=null && detail.getProfile()!=null && detail.getProfile().isOnboardingCompleted())
                .profileCompleted(detail!=null && detail.getProfile()!=null && detail.getProfile().isProfileCompleted())
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

}
