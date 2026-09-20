package EazyTech.EazyHire;

import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.repositories.AdminUserSpecifications;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@DataJpaTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:admin-user-repository;MODE=PostgreSQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class AdminUserRepositoryTest {
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    private CompanyEntity companyA;
    private CompanyEntity companyB;

    @BeforeEach
    void setUp() {
        companyA = companyRepository.save(company("tech-a", "Tech A"));
        companyB = companyRepository.save(company("tech-b", "Tech B"));
        userRepository.save(user("hr-a@tech-a.vn", "HR A", companyA, UserRole.HR, UserStatus.ACTIVE));
        userRepository.save(user("admin-a@tech-a.vn", "Admin A", companyA, UserRole.ADMIN, UserStatus.ACTIVE));
        userRepository.save(user("hr-b@tech-b.vn", "HR B", companyB, UserRole.HR_ADMIN, UserStatus.INACTIVE));
    }

    @Test
    void findsAllUsersWhenOptionalFiltersAreAbsent() {
        Page<UserEntity> result = userRepository.findAll(
                AdminUserSpecifications.search(null, null, null, null),
                PageRequest.of(0, 20)
        );

        assertEquals(3, result.getTotalElements());
    }

    @Test
    void filtersUsersBySearchCompanyRoleAndStatus() {
        Page<UserEntity> result = userRepository.findAll(
                AdminUserSpecifications.search("HR B", companyB.getId(), UserRole.HR_ADMIN, UserStatus.INACTIVE),
                PageRequest.of(0, 20)
        );

        assertEquals(1, result.getTotalElements());
        assertEquals("hr-b@tech-b.vn", result.getContent().get(0).getEmail());
    }

    private CompanyEntity company(String slug, String name) {
        return CompanyEntity.builder()
                .slug(slug)
                .name(name)
                .status(CompanyStatus.ACTIVE)
                .build();
    }

    private UserEntity user(
            String email,
            String fullName,
            CompanyEntity company,
            UserRole role,
            UserStatus status
    ) {
        return UserEntity.builder()
                .email(email)
                .fullName(fullName)
                .company(company)
                .role(role)
                .status(status)
                .build();
    }
}
