package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface HiringRoundRepository extends JpaRepository<HiringRoundEntity, Long> {
    List<HiringRoundEntity> findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(Long jobId, Long companyId);
    Optional<HiringRoundEntity> findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(Long id, Long jobId, Long companyId);
    long countByJobIdAndCompanyIdAndIsDeletedFalse(Long jobId, Long companyId);
}
