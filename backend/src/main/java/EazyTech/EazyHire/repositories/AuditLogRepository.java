package EazyTech.EazyHire.repositories;
import EazyTech.EazyHire.models.entities.AuditLogEntity;
import org.springframework.data.jpa.repository.JpaRepository;
public interface AuditLogRepository extends JpaRepository<AuditLogEntity,Long> {}
