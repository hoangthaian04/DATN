package EazyTech.EazyHire.repositories;
import EazyTech.EazyHire.models.entities.AuditLogEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
public interface AuditLogRepository extends JpaRepository<AuditLogEntity, Long>, JpaSpecificationExecutor<AuditLogEntity> {

 @Query("""
   SELECT a FROM AuditLogEntity a
   WHERE a.actorUserId = :userId
     AND a.action IN ('LOGIN', 'AUTH_SESSION')
   ORDER BY a.createdAt DESC, a.id DESC
   """)
 List<AuditLogEntity> findRecentLoginEvents(@Param("userId") Long userId,
                                            org.springframework.data.domain.Pageable pageable);
}
