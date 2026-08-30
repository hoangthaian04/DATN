package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.CareerSiteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CareerSiteRepository extends JpaRepository<CareerSiteEntity, Long> {
    Optional<CareerSiteEntity> findByCompanyId(Long companyId);
}
