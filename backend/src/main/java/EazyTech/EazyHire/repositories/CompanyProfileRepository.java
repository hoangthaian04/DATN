package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.CompanyProfileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyProfileRepository extends JpaRepository<CompanyProfileEntity, Long> {
    Optional<CompanyProfileEntity> findByCompanyId(Long companyId);
}
