package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.CompanyDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.GoogleLoginRequestDTO;
import EazyTech.EazyHire.models.dtos.LoginRequestDTO;
import EazyTech.EazyHire.models.dtos.LoginResponseDTO;
import EazyTech.EazyHire.models.dtos.OnboardingRequestDTO;
import EazyTech.EazyHire.models.dtos.RegisterRequestDTO;
import EazyTech.EazyHire.models.dtos.UserResponseDTO;

public interface AuthService {

    LoginResponseDTO register(RegisterRequestDTO request);

    LoginResponseDTO login(LoginRequestDTO request);

    LoginResponseDTO adminLogin(LoginRequestDTO request);

    LoginResponseDTO googleLogin(GoogleLoginRequestDTO request);

    CompanyDetailResponseDTO onboarding(Long userId, OnboardingRequestDTO request);

    UserResponseDTO getMe(Long userId);

    LoginResponseDTO refreshToken(String refreshToken);

    void forgotPassword(String email);

    String verifyOtp(String email, String otp);

    void resetPassword(String resetToken, String newPassword);

    void changePassword(Long userId, String currentPassword, String newPassword);
}
