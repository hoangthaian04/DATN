package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.AdminCompanyUpdateRequestDTO;
import EazyTech.EazyHire.models.dtos.CompanyDetailResponseDTO;
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
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.EmailService;
import EazyTech.EazyHire.services.LogoStorageService;
import EazyTech.EazyHire.services.UserAccountService;
import EazyTech.EazyHire.services.impl.CompanyServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CompanyServiceImplTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyProfileRepository companyProfileRepository;

    @Mock
    private CareerSiteRepository careerSiteRepository;

    @Mock
    private UserAccountService accounts;

    @Mock
    private AuditService audit;

    @Mock
    private EmailService emails;

    @Mock
    private LogoStorageService logos;

    @InjectMocks
    private CompanyServiceImpl service;

    @Test
    void rejectKeepsApprovalMetadataEmptyAndMovesRegistrantBackToPending() {
        CompanyEntity company = company(CompanyStatus.PENDING);
        UserEntity admin = UserEntity.builder().id(99L).role(UserRole.ADMIN).status(UserStatus.ACTIVE).build();

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(accounts.requireAdmin(99L)).thenReturn(admin);
        when(companyRepository.save(any(CompanyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.rejectCompany(1L, 99L, " Mã số thuế không khớp. ");

        assertEquals(CompanyStatus.REJECTED, company.getStatus());
        assertEquals("Mã số thuế không khớp.", company.getRejectedReason());
        assertNull(company.getApprovedBy());
        assertNull(company.getApprovedAt());
        assertEquals(CompanyStatus.REJECTED, result.getStatus());
        verify(accounts).activateCompanyUsers(1L, UserStatus.PENDING);
        verify(audit).record(99L, 1L, "REJECT_COMPANY", "Mã số thuế không khớp.");
        verify(emails).sendEmail(any(), any(), any());
    }

    @Test
    void rejectRequiresAReasonWithAtLeastTenCharacters() {
        CompanyEntity company = company(CompanyStatus.PENDING);

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(accounts.requireAdmin(99L)).thenReturn(admin());

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.rejectCompany(1L, 99L, "quá ngắn")
        );

        assertEquals(400, exception.getStatusCode());
        verify(companyRepository, never()).save(any());
        verify(accounts, never()).activateCompanyUsers(any(), any());
        verify(audit, never()).record(any(), any(), any(), any());
    }

    @Test
    void approveActivatesPendingUsersAndCreatesDefaultCareerSite() {
        CompanyEntity company = company(CompanyStatus.PENDING);
        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(accounts.requireAdmin(99L)).thenReturn(admin());
        when(companyRepository.save(any(CompanyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.empty());
        when(careerSiteRepository.save(any(CareerSiteEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.approveCompany(1L, 99L);

        assertEquals(CompanyStatus.ACTIVE, company.getStatus());
        assertEquals(CompanyStatus.ACTIVE, result.getStatus());
        verify(accounts).activateCompanyUsers(1L, UserStatus.ACTIVE);
        verify(audit).record(99L, 1L, "APPROVE_COMPANY", "Phê duyệt doanh nghiệp");
        verify(careerSiteRepository).save(any(CareerSiteEntity.class));
    }

    @Test
    void companyDetailReturnsTheEarliestHrRegistrantWithoutSensitiveFields() {
        CompanyEntity company = company(CompanyStatus.PENDING);
        CompanyProfileEntity profile = CompanyProfileEntity.builder()
                .id(10L)
                .company(company)
                .onboardingCompleted(false)
                .build();
        UserEntity registrant = UserEntity.builder()
                .id(7L)
                .company(company)
                .email("hr@example.com")
                .fullName("Nguyen Van A")
                .role(UserRole.HR_ADMIN)
                .status(UserStatus.PENDING)
                .createdAt(LocalDateTime.of(2026, 9, 18, 10, 0))
                .passwordHash("must-not-be-returned")
                .build();

        when(companyRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(company));
        when(companyProfileRepository.findByCompanyId(1L)).thenReturn(Optional.of(profile));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.empty());
        when(accounts.getCompanyUsers(1L)).thenReturn(List.of(registrant));

        CompanyDetailResponseDTO result = service.getCompanyDetail(1L);

        assertEquals(7L, result.getRegistrant().getId());
        assertEquals("hr@example.com", result.getRegistrant().getEmail());
        assertEquals(UserRole.HR_ADMIN, result.getRegistrant().getRole());
    }

    @Test
    void adminUpdatePersistsCompanyProfileAndCareerSiteFieldsAndAuditsChange() {
        CompanyEntity company = company(CompanyStatus.ACTIVE);
        CompanyProfileEntity profile = CompanyProfileEntity.builder().id(10L).company(company).build();
        CareerSiteEntity careerSite = CareerSiteEntity.builder().id(20L).company(company).build();

        when(companyRepository.findById(1L)).thenReturn(Optional.of(company));
        when(companyRepository.findByIdWithDetails(1L)).thenReturn(Optional.of(company));
        when(accounts.requireAdmin(99L)).thenReturn(admin());
        when(companyProfileRepository.findByCompanyId(1L)).thenReturn(Optional.of(profile));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(careerSite));
        when(companyRepository.save(any(CompanyEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(companyProfileRepository.save(any(CompanyProfileEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(careerSiteRepository.save(any(CareerSiteEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(accounts.getCompanyUsers(1L)).thenReturn(List.of());

        AdminCompanyUpdateRequestDTO request = AdminCompanyUpdateRequestDTO.builder()
                .name("TechA Updated")
                .taxCode("0123456789")
                .subdomain("techa-updated")
                .bannerUrl("https://cdn.example/banner.png")
                .primaryColor("#2563eb")
                .siteTitle("TechA Careers")
                .showBenefits(false)
                .footerText("TechA tuyển dụng")
                .build();

        CompanyDetailResponseDTO result = service.updateCompanyByAdmin(1L, 99L, request);

        assertEquals("TechA Updated", company.getName());
        assertEquals("0123456789", company.getTaxCode());
        assertEquals("techa-updated", company.getSubdomain());
        assertEquals("https://cdn.example/banner.png", profile.getBannerUrl());
        assertEquals("#2563eb", profile.getPrimaryColor());
        assertEquals("TechA Careers", careerSite.getSiteTitle());
        assertEquals(false, careerSite.getShowBenefits());
        assertEquals("TechA tuyển dụng", careerSite.getFooterText());
        assertEquals("TechA Updated", result.getName());
        verify(audit).record(99L, 1L, "UPDATE_COMPANY", "Admin cập nhật thông tin doanh nghiệp");
    }

    private CompanyEntity company(CompanyStatus status) {
        return CompanyEntity.builder()
                .id(1L)
                .name("TechA Solutions")
                .slug("techa-solutions")
                .email("hr@techa.vn")
                .status(status)
                .build();
    }

    private UserEntity admin() {
        return UserEntity.builder().id(99L).role(UserRole.ADMIN).status(UserStatus.ACTIVE).build();
    }
}
