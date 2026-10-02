package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.CvAnalysisEntity;
import EazyTech.EazyHire.models.enums.CvAnalysisStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CvAnalysisRepository extends JpaRepository<CvAnalysisEntity, Long> {

    Optional<CvAnalysisEntity> findFirstByApplicationIdAndCompanyIdAndStatusOrderByCreatedAtDesc(
            Long applicationId,
            Long companyId,
            CvAnalysisStatus status
    );

    @Query(value = """
            SELECT c.id AS candidateId,
                   source_application.id AS sourceApplicationId,
                   c.full_name AS candidateName,
                   c.email AS email,
                   source_application.summary AS summary,
                   source_application.matched_skills AS matchedSkillsJson,
                   source_application.strengths AS strengthsJson,
                   source_application.applied_at AS recentApplicationAt
            FROM candidates c
            JOIN LATERAL (
                SELECT a.id, a.applied_at, analysis.summary, analysis.matched_skills, analysis.strengths
                FROM applications a
                JOIN LATERAL (
                    SELECT ca.summary, ca.matched_skills, ca.strengths
                    FROM cv_analyses ca
                    WHERE ca.application_id = a.id
                      AND ca.company_id = :companyId
                      AND ca.status = 'COMPLETED'
                    ORDER BY ca.created_at DESC, ca.id DESC
                    LIMIT 1
                ) analysis ON TRUE
                WHERE a.candidate_id = c.id
                  AND a.company_id = :companyId
                  AND a.job_id <> :jobId
                  AND a.consent_accepted = TRUE
                  AND NULLIF(BTRIM(a.cv_url), '') IS NOT NULL
                ORDER BY a.applied_at DESC, a.id DESC
                LIMIT 1
            ) source_application ON TRUE
            WHERE c.company_id = :companyId
              AND COALESCE(c.is_deleted, FALSE) = FALSE
              AND NOT EXISTS (
                  SELECT 1
                  FROM applications current_application
                  WHERE current_application.company_id = :companyId
                    AND current_application.job_id = :jobId
                    AND current_application.candidate_id = c.id
              )
            ORDER BY source_application.applied_at DESC, c.id
            """, nativeQuery = true)
    List<AiMatchingCandidateProjection> findEligibleCandidatesForMatching(
            @Param("companyId") Long companyId,
            @Param("jobId") Long jobId
    );
}
