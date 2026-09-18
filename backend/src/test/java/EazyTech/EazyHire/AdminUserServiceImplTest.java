package EazyTech.EazyHire;

import EazyTech.EazyHire.models.dtos.AdminUserFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.AdminUserStatusRequestDTO;
import EazyTech.EazyHire.models.entities.AuditLogEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.repositories.AuditLogRepository;
import EazyTech.EazyHire.repositories.AdminUserSpecifications;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.UserAccountService;
import EazyTech.EazyHire.services.impl.AdminUserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceImplTest {
    @Mock private UserRepository userRepository;
    @Mock private JobRepository jobRepository;
    @Mock private AuditLogRepository auditLogRepository;
    @Mock private UserAccountService accounts;
    @Mock private AuditService auditService;
    @InjectMocks private AdminUserServiceImpl service;

    @Test
    void listsUsersWithBackendPaginationAndCompanySummary() {
        CompanyEntity company = CompanyEntity.builder().id(7L).name("Tech A").status(CompanyStatus.ACTIVE).build();
        UserEntity user = UserEntity.builder().id(12L).company(company).email("hr@tech-a.vn")
                .fullName("HR A").role(UserRole.HR).status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now()).build();
        AdminUserFilterRequestDTO request = new AdminUserFilterRequestDTO();
        request.setSearch("hr");

        when(userRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(user), request.getPageable(), 1));

        var result = service.getUsers(request);

        assertEquals(1, result.getTotalElements());
        assertEquals("Tech A", result.getContent().get(0).getCompanyName());
        verify(userRepository).findAll(any(Specification.class), any(PageRequest.class));
    }

    @Test
    void detailIncludesJobsAndRecentAuditSessions() {
        CompanyEntity company = CompanyEntity.builder().id(7L).name("Tech A").build();
        UserEntity user = UserEntity.builder().id(12L).company(company).email("hr@tech-a.vn")
                .fullName("HR A").role(UserRole.HR).status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now()).build();
        AuditLogEntity login = new AuditLogEntity();
        login.setCreatedAt(LocalDateTime.now());
        login.setIpAddress("127.0.0.1");
        login.setUserAgent("Test Browser");

        when(userRepository.findByIdWithCompany(12L)).thenReturn(Optional.of(user));
        when(jobRepository.countByCreatedByIdAndIsDeletedFalse(12L)).thenReturn(3L);
        when(auditLogRepository.findRecentLoginEvents(eq(12L), any())).thenReturn(List.of(login));

        var result = service.getUser(12L);

        assertEquals(3L, result.getJobsCreatedCount());
        assertEquals(1, result.getRecentLogins().size());
        assertEquals("127.0.0.1", result.getRecentLogins().get(0).getIpAddress());
    }

    @Test
    void deactivatingUserIncrementsTokenVersionAndAuditsReason() {
        UserEntity admin = UserEntity.builder().id(1L).role(UserRole.ADMIN).status(UserStatus.ACTIVE).build();
        UserEntity target = UserEntity.builder().id(12L).role(UserRole.HR).status(UserStatus.ACTIVE).tokenVersion(4).build();
        AdminUserStatusRequestDTO request = new AdminUserStatusRequestDTO();
        request.setStatus(UserStatus.INACTIVE);
        request.setReason("Vi phạm chính sách");

        when(accounts.requireAdmin(1L)).thenReturn(admin);
        when(userRepository.findByIdWithCompany(12L)).thenReturn(Optional.of(target));

        service.changeStatus(12L, 1L, request);

        assertEquals(UserStatus.INACTIVE, target.getStatus());
        assertEquals(5, target.getTokenVersion());
        verify(auditService).recordGlobal(1L, "USER", 12L, "DEACTIVATE_USER",
                "previousStatus=ACTIVE;newStatus=INACTIVE;reason=Vi phạm chính sách");
    }

    @Test
    void doesNotAllowAdminToDeactivateSelf() {
        UserEntity admin = UserEntity.builder().id(1L).role(UserRole.ADMIN).status(UserStatus.ACTIVE).build();
        AdminUserStatusRequestDTO request = new AdminUserStatusRequestDTO();
        request.setStatus(UserStatus.INACTIVE);
        request.setReason("Test");
        when(accounts.requireAdmin(1L)).thenReturn(admin);
        when(userRepository.findByIdWithCompany(1L)).thenReturn(Optional.of(admin));

        assertThrows(RuntimeException.class, () -> service.changeStatus(1L, 1L, request));
    }

    @Test
    void requiresReasonWhenDeactivatingUser() {
        UserEntity admin = UserEntity.builder().id(1L).role(UserRole.ADMIN).status(UserStatus.ACTIVE).build();
        UserEntity target = UserEntity.builder().id(12L).role(UserRole.HR).status(UserStatus.ACTIVE).build();
        AdminUserStatusRequestDTO request = new AdminUserStatusRequestDTO();
        request.setStatus(UserStatus.INACTIVE);
        request.setReason(" ");
        when(accounts.requireAdmin(1L)).thenReturn(admin);
        when(userRepository.findByIdWithCompany(12L)).thenReturn(Optional.of(target));

        assertThrows(RuntimeException.class, () -> service.changeStatus(12L, 1L, request));
        verify(userRepository, org.mockito.Mockito.never()).save(any(UserEntity.class));
        verify(auditService, org.mockito.Mockito.never()).recordGlobal(any(), any(), any(), any(), any());
    }

    @Test
    void doesNotAllowChangingSystemAdminStatus() {
        UserEntity admin = UserEntity.builder().id(1L).role(UserRole.ADMIN).status(UserStatus.ACTIVE).build();
        UserEntity target = UserEntity.builder().id(12L).role(UserRole.ADMIN).status(UserStatus.ACTIVE).build();
        AdminUserStatusRequestDTO request = new AdminUserStatusRequestDTO();
        request.setStatus(UserStatus.INACTIVE);
        request.setReason("Vi phạm chính sách");
        when(accounts.requireAdmin(1L)).thenReturn(admin);
        when(userRepository.findByIdWithCompany(12L)).thenReturn(Optional.of(target));

        assertThrows(RuntimeException.class, () -> service.changeStatus(12L, 1L, request));
        verify(userRepository, org.mockito.Mockito.never()).save(any(UserEntity.class));
    }
}
