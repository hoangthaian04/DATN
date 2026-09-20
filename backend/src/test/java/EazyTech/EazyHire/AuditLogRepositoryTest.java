package EazyTech.EazyHire;

import EazyTech.EazyHire.models.entities.AuditLogEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.repositories.AuditLogRepository;
import EazyTech.EazyHire.repositories.AuditLogSpecifications;
import EazyTech.EazyHire.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:audit-log-repository;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class AuditLogRepositoryTest {
    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private UserRepository userRepository;

    private UserEntity actor;

    @BeforeEach
    void setUp() {
        actor = userRepository.save(UserEntity.builder()
                .email("Admin@EasyTech.vn")
                .fullName("System Admin")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build());

        auditLogRepository.save(log("LOGIN", actor.getId(), LocalDateTime.of(2026, 9, 18, 10, 0)));
        auditLogRepository.save(log("CREATE_JOB", actor.getId(), LocalDateTime.of(2026, 9, 17, 10, 0)));
        auditLogRepository.save(log("LOGIN", null, LocalDateTime.of(2026, 9, 16, 10, 0)));
    }

    @Test
    void findsLogsWithoutOptionalFilters() {
        Page<AuditLogEntity> result = auditLogRepository.findAll(
                AuditLogSpecifications.search(null, null, null, null),
                PageRequest.of(0, 50, Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id")))
        );

        assertEquals(3, result.getTotalElements());
        assertEquals("LOGIN", result.getContent().get(0).getAction());
    }

    @Test
    void filtersLogsByActorEmailWithoutNullableQueryParameters() {
        Page<AuditLogEntity> result = auditLogRepository.findAll(
                AuditLogSpecifications.search(null, "admin@easytech.vn", null, null),
                PageRequest.of(0, 50)
        );

        assertEquals(2, result.getTotalElements());
    }

    private AuditLogEntity log(String action, Long actorUserId, LocalDateTime createdAt) {
        AuditLogEntity log = new AuditLogEntity();
        log.setAction(action);
        log.setTargetType("SYSTEM");
        log.setActorUserId(actorUserId);
        log.setCreatedAt(createdAt);
        return log;
    }
}
