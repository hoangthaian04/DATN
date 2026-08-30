package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.models.dtos.response.RegistrationResponseDTO;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import com.easytech.eazyhire.security.JwtTokenProvider;
import com.easytech.eazyhire.services.CompanyService;
import com.easytech.eazyhire.services.EmailNotificationService;
import com.easytech.eazyhire.services.PasswordService;
import com.easytech.eazyhire.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.web.client.RestClient;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceImplTest {
    private UserService userService;
    private CompanyService companyService;
    private EmailNotificationService emailNotificationService;
    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        userService = mock(UserService.class);
        companyService = mock(CompanyService.class);
        emailNotificationService = mock(EmailNotificationService.class);
        authService = new AuthServiceImpl(
                userService,
                companyService,
                mock(PasswordService.class),
                mock(JwtTokenProvider.class),
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
}
