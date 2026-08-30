package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.UserEntity;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import com.easytech.eazyhire.models.enums.UserRole;
import com.easytech.eazyhire.models.mappers.CompanyMapper;
import com.easytech.eazyhire.repositories.CareerSiteRepository;
import com.easytech.eazyhire.repositories.CompanyProfileRepository;
import com.easytech.eazyhire.repositories.CompanyRepository;
import com.easytech.eazyhire.services.AuditLogService;
import com.easytech.eazyhire.services.EmailNotificationService;
import com.easytech.eazyhire.services.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CompanyServiceImplTest {
    private CompanyRepository companyRepository;
    private CareerSiteRepository careerSiteRepository;
    private UserService userService;
    private AuditLogService auditLogService;
    private EmailNotificationService emailNotificationService;
    private CompanyServiceImpl companyService;

    @BeforeEach
    void setUp() {
        companyRepository = mock(CompanyRepository.class);
        careerSiteRepository = mock(CareerSiteRepository.class);
        userService = mock(UserService.class);
        auditLogService = mock(AuditLogService.class);
        emailNotificationService = mock(EmailNotificationService.class);
        companyService = new CompanyServiceImpl(
                companyRepository,
                mock(CompanyProfileRepository.class),
                careerSiteRepository,
                userService,
                auditLogService,
                emailNotificationService,
                mock(CompanyMapper.class)
        );
    }

    @Test
    void approveActivatesAllUsersCreatesCareerSiteAndWritesAuditLog() {
        CompanyEntity company = CompanyEntity.builder()
                .id(11L).name("Demo Co").email("hr@demo.vn").status(CompanyStatus.PENDING).build();
        UserEntity admin = UserEntity.builder().id(1L).role(UserRole.ADMIN).build();
        when(companyRepository.findByIdWithDetails(11L)).thenReturn(Optional.of(company));
        when(userService.getById(1L)).thenReturn(admin);
        when(careerSiteRepository.findByCompanyId(11L)).thenReturn(Optional.empty());
        when(companyRepository.save(company)).thenReturn(company);

        companyService.updateCompanyStatus(11L, 1L, CompanyStatus.ACTIVE, null);

        verify(userService).updateCompanyUsersStatus(11L, com.easytech.eazyhire.models.enums.UserStatus.ACTIVE);
        verify(careerSiteRepository).save(any());
        verify(emailNotificationService).sendCompanyApproved("hr@demo.vn", "Demo Co");
        verify(auditLogService).record(company, admin, "APPROVE_BUSINESS", "COMPANY", 11L,
                "{\"fromStatus\":\"PENDING\",\"toStatus\":\"ACTIVE\"}");
    }

    @Test
    void rejectRequiresMeaningfulReason() {
        CompanyEntity company = CompanyEntity.builder().id(11L).status(CompanyStatus.PENDING).build();
        when(companyRepository.findByIdWithDetails(11L)).thenReturn(Optional.of(company));
        when(userService.getById(1L)).thenReturn(UserEntity.builder().id(1L).role(UserRole.ADMIN).build());

        assertThatThrownBy(() -> companyService.updateCompanyStatus(
                11L, 1L, CompanyStatus.REJECTED, "quá ngắn"
        )).isInstanceOf(CustomException.class);
    }
}
