package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.models.dtos.request.LoginRequestDTO;
import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.models.dtos.response.LoginResponseDTO;
import com.easytech.eazyhire.models.dtos.response.RegistrationResponseDTO;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.CompanyProfileEntity;
import com.easytech.eazyhire.models.entities.UserEntity;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import com.easytech.eazyhire.models.enums.UserRole;
import com.easytech.eazyhire.models.enums.UserStatus;
import com.easytech.eazyhire.security.JwtTokenProvider;
import com.easytech.eazyhire.services.CompanyService;
import com.easytech.eazyhire.services.EmailNotificationService;
import com.easytech.eazyhire.services.PasswordService;
import com.easytech.eazyhire.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {
    private UserService userService;
    private CompanyService companyService;
    private PasswordService passwordService;
    private JwtTokenProvider tokenProvider;
    private EmailNotificationService emailNotificationService;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        companyService = mock(CompanyService.class);
        passwordService = mock(PasswordService.class);
        tokenProvider = mock(JwtTokenProvider.class);
        emailNotificationService = mock(EmailNotificationService.class);
        authService = new AuthServiceImpl(
                userService,
                companyService,
                passwordService,
                tokenProvider,
                emailNotificationService,
                mock(RestClient.Builder.class)
        );
    }

    @Test
    void registerCreatesPendingCompanyAndDoesNotCreateSession() {
        RegisterRequestDTO request = RegisterRequestDTO.builder()
                .email(" HR@Example.com ")
                .password("StrongPass1")
                .fullName("HR Manager")
                .companyName("EasyTech Demo")
                .taxCode("0101234567")
                .build();
        CompanyEntity company = CompanyEntity.builder()
                .id(10L)
                .name("EasyTech Demo")
                .email("hr@example.com")
                .status(CompanyStatus.PENDING)
                .build();
        when(companyService.createPendingCompany(request)).thenReturn(company);

        RegistrationResponseDTO response = authService.register(request);

        assertThat(response.getEmail()).isEqualTo("hr@example.com");
        assertThat(response.getCompanyStatus()).isEqualTo(CompanyStatus.PENDING);
        verify(companyService).createInitialProfile(company, request);
        verify(userService).createPendingHrAdministrator(request, company);
        verify(emailNotificationService).sendRegistrationReceived("hr@example.com", "EasyTech Demo");
        verify(emailNotificationService).notifyAdminOfRegistration("EasyTech Demo", "hr@example.com");
    }

    @Test
    void loginAllowsPendingCompanyAndPendingUserSession() {
        CompanyEntity company = CompanyEntity.builder()
                .id(11L)
                .name("Pending Co")
                .slug("pending-co")
                .status(CompanyStatus.PENDING)
                .build();
        UserEntity user = UserEntity.builder()
                .id(21L)
                .email("hr@pending.vn")
                .fullName("Pending HR")
                .passwordHash("hash")
                .role(UserRole.HR_ADMIN)
                .status(UserStatus.PENDING)
                .company(company)
                .build();
        when(userService.findByEmailWithCompany("hr@pending.vn")).thenReturn(java.util.Optional.of(user));
        when(passwordService.matches("Password1", "hash")).thenReturn(true);
        when(tokenProvider.generateAccessToken(user)).thenReturn("access");
        when(tokenProvider.generateRefreshToken(user)).thenReturn("refresh");
        when(tokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(companyService.getProfile(11L)).thenReturn(CompanyProfileEntity.builder()
                .company(company)
                .onboardingCompleted(false)
                .profileCompleted(false)
                .build());

        LoginResponseDTO response = authService.login(LoginRequestDTO.builder()
                .email("hr@pending.vn")
                .password("Password1")
                .build());

        assertThat(response.getUser().getCompanyStatus()).isEqualTo(CompanyStatus.PENDING);
        assertThat(response.getUser().getStatus()).isEqualTo(UserStatus.PENDING);
        assertThat(response.getUser().getOnboardingCompleted()).isFalse();
    }

    @Test
    void loginAllowsRejectedCompanyAndPendingUserSession() {
        CompanyEntity company = CompanyEntity.builder()
                .id(12L)
                .name("Rejected Co")
                .slug("rejected-co")
                .status(CompanyStatus.REJECTED)
                .rejectedReason("Thông tin chưa khớp")
                .build();
        UserEntity user = UserEntity.builder()
                .id(22L)
                .email("hr@rejected.vn")
                .fullName("Rejected HR")
                .passwordHash("hash")
                .role(UserRole.HR_ADMIN)
                .status(UserStatus.PENDING)
                .company(company)
                .build();
        when(userService.findByEmailWithCompany("hr@rejected.vn")).thenReturn(java.util.Optional.of(user));
        when(passwordService.matches("Password1", "hash")).thenReturn(true);
        when(tokenProvider.generateAccessToken(user)).thenReturn("access");
        when(tokenProvider.generateRefreshToken(user)).thenReturn("refresh");
        when(tokenProvider.getAccessTokenExpirationMs()).thenReturn(900000L);
        when(companyService.getProfile(12L)).thenReturn(CompanyProfileEntity.builder()
                .company(company)
                .onboardingCompleted(false)
                .profileCompleted(false)
                .build());

        LoginResponseDTO response = authService.login(LoginRequestDTO.builder()
                .email("hr@rejected.vn")
                .password("Password1")
                .build());

        assertThat(response.getUser().getCompanyStatus()).isEqualTo(CompanyStatus.REJECTED);
        assertThat(response.getUser().getStatus()).isEqualTo(UserStatus.PENDING);
    }

    @Test
    void loginRejectsInactiveUser() {
        CompanyEntity company = CompanyEntity.builder()
                .id(13L)
                .name("Active Co")
                .slug("active-co")
                .status(CompanyStatus.ACTIVE)
                .build();
        UserEntity user = UserEntity.builder()
                .id(23L)
                .email("hr@inactive.vn")
                .fullName("Inactive HR")
                .passwordHash("hash")
                .role(UserRole.HR_ADMIN)
                .status(UserStatus.INACTIVE)
                .company(company)
                .build();
        when(userService.findByEmailWithCompany("hr@inactive.vn")).thenReturn(java.util.Optional.of(user));
        when(passwordService.matches("Password1", "hash")).thenReturn(true);

        assertThatThrownBy(() -> authService.login(LoginRequestDTO.builder()
                .email("hr@inactive.vn")
                .password("Password1")
                .build()))
                .isInstanceOf(CustomException.class)
                .hasMessageContaining("vô hiệu hóa");
    }
}
