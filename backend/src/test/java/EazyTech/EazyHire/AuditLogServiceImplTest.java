package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.entities.AuditLogEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.models.dtos.AuditLogFilterRequestDTO;
import EazyTech.EazyHire.repositories.AuditLogRepository;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.services.impl.AuditLogServiceImpl;
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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuditLogServiceImplTest {
    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private CompanyRepository companyRepository;

    @InjectMocks
    private AuditLogServiceImpl service;

    @Test
    void listMapsActorCompanyAndUsesLongIdentifiers() {
        AuditLogEntity log = log();
        UserEntity actor = UserEntity.builder()
                .id(10L).email("hr@techa.vn").fullName("Nguyen Van A")
                .role(UserRole.HR).status(UserStatus.ACTIVE).build();
        CompanyEntity company = CompanyEntity.builder()
                .id(1L).name("TechA Solutions").slug("techa")
                .status(CompanyStatus.ACTIVE).build();
        AuditLogFilterRequestDTO request = new AuditLogFilterRequestDTO();

        when(auditLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(log), PageRequest.of(0, 50), 1));
        when(userRepository.findAllById(any())).thenReturn(List.of(actor));
        when(companyRepository.findAllById(any())).thenReturn(List.of(company));

        var result = service.getLogs(request);

        assertEquals(1, result.getTotalElements());
        assertEquals(123L, result.getContent().get(0).getId());
        assertEquals(10L, result.getContent().get(0).getActor().getId());
        assertEquals("hr@techa.vn", result.getContent().get(0).getActor().getEmail());
        assertEquals("TechA Solutions", result.getContent().get(0).getCompanyName());
        assertEquals("192.168.1.10", result.getContent().get(0).getIpAddress());
    }

    @Test
    void listKeepsSystemActorNullWhenActorWasDeleted() {
        AuditLogFilterRequestDTO request = new AuditLogFilterRequestDTO();
        AuditLogEntity log = log();
        log.setActorUserId(null);
        log.setCompanyId(null);

        when(auditLogRepository.findAll(any(Specification.class), any(PageRequest.class)))
                .thenReturn(new PageImpl<>(List.of(log), PageRequest.of(0, 50), 1));
        when(userRepository.findAllById(any())).thenReturn(List.of());
        when(companyRepository.findAllById(any())).thenReturn(List.of());

        var result = service.getLogs(request);

        assertNull(result.getContent().get(0).getActor());
    }

    @Test
    void detailReturns404WhenLogDoesNotExist() {
        when(auditLogRepository.findById(404L)).thenReturn(Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () -> service.getLog(404L));

        assertEquals(404, exception.getStatusCode());
    }

    private AuditLogEntity log() {
        AuditLogEntity log = new AuditLogEntity();
        log.setId(123L);
        log.setActorUserId(10L);
        log.setCompanyId(1L);
        log.setActorRole("HR");
        log.setAction("CREATE_JOB");
        log.setTargetType("JOB");
        log.setTargetId(987L);
        log.setIpAddress("192.168.1.10");
        log.setMetadata("Tạo job");
        log.setCreatedAt(LocalDateTime.of(2026, 9, 18, 10, 0));
        return log;
    }
}
