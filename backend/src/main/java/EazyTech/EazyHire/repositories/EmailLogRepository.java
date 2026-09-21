package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.EmailLogEntity;
import EazyTech.EazyHire.models.enums.EmailLogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface EmailLogRepository extends JpaRepository<EmailLogEntity, Long> {
    @Query("""
            SELECT e FROM EmailLogEntity e
            WHERE e.companyId = :companyId
              AND (:status IS NULL OR e.status = :status)
              AND (:templateCode IS NULL OR e.templateCode = :templateCode)
            ORDER BY e.createdAt DESC, e.id DESC
            """)
    Page<EmailLogEntity> findForCompany(
            @Param("companyId") Long companyId,
            @Param("status") EmailLogStatus status,
            @Param("templateCode") String templateCode,
            Pageable pageable
    );

    Optional<EmailLogEntity> findByIdAndCompanyId(Long id, Long companyId);
}
