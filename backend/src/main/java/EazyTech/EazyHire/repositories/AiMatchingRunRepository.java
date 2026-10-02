package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.AiMatchingRunEntity;
import EazyTech.EazyHire.models.enums.AiMatchingRunStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AiMatchingRunRepository extends JpaRepository<AiMatchingRunEntity, Long> {

    Optional<AiMatchingRunEntity> findFirstByJobIdAndCompanyIdOrderByCreatedAtDesc(Long jobId, Long companyId);

    Optional<AiMatchingRunEntity> findFirstByIdAndJobIdAndCompanyId(Long id, Long jobId, Long companyId);

    Optional<AiMatchingRunEntity> findFirstByJobIdAndCompanyIdAndStatusInOrderByCreatedAtDesc(
            Long jobId,
            Long companyId,
            List<AiMatchingRunStatus> statuses
    );

    List<AiMatchingRunEntity> findTop10ByStatusOrderByCreatedAtAsc(AiMatchingRunStatus status);

    @Modifying
    @Query("""
            UPDATE AiMatchingRunEntity run
            SET run.status = EazyTech.EazyHire.models.enums.AiMatchingRunStatus.PROCESSING,
                run.startedAt = :now,
                run.leaseUntil = :leaseUntil,
                run.errorMessage = null
            WHERE run.id = :runId
              AND run.status = EazyTech.EazyHire.models.enums.AiMatchingRunStatus.QUEUED
            """)
    int claimQueuedRun(
            @Param("runId") Long runId,
            @Param("now") LocalDateTime now,
            @Param("leaseUntil") LocalDateTime leaseUntil
    );

    @Modifying
    @Query("""
            UPDATE AiMatchingRunEntity run
            SET run.leaseUntil = :leaseUntil
            WHERE run.id = :runId
              AND run.status = EazyTech.EazyHire.models.enums.AiMatchingRunStatus.PROCESSING
            """)
    int renewLease(@Param("runId") Long runId, @Param("leaseUntil") LocalDateTime leaseUntil);

    @Modifying
    @Query("""
            UPDATE AiMatchingRunEntity run
            SET run.status = EazyTech.EazyHire.models.enums.AiMatchingRunStatus.QUEUED,
                run.startedAt = null,
                run.leaseUntil = null
            WHERE run.status = EazyTech.EazyHire.models.enums.AiMatchingRunStatus.PROCESSING
              AND run.leaseUntil < :now
            """)
    int requeueExpiredRuns(@Param("now") LocalDateTime now);

    @Query("""
            SELECT run.id FROM AiMatchingRunEntity run
            WHERE run.status = EazyTech.EazyHire.models.enums.AiMatchingRunStatus.QUEUED
            ORDER BY run.createdAt ASC, run.id ASC
            """)
    List<Long> findQueuedRunIds(Pageable pageable);
}
