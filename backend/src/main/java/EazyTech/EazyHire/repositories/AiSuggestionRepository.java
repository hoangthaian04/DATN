package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.AiSuggestionEntity;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiSuggestionRepository extends JpaRepository<AiSuggestionEntity, Long> {

    @Query("""
            SELECT suggestion FROM AiSuggestionEntity suggestion
            JOIN CandidateEntity candidate ON candidate.id = suggestion.candidateId
            WHERE suggestion.jobId = :jobId
              AND suggestion.companyId = :companyId
              AND candidate.company.id = :companyId
              AND COALESCE(candidate.isDeleted, false) = false
            ORDER BY suggestion.matchingScore DESC, suggestion.id ASC
            """)
    List<AiSuggestionEntity> findForJob(
            @Param("jobId") Long jobId,
            @Param("companyId") Long companyId
    );

    boolean existsByJobIdAndCompanyId(Long jobId, Long companyId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT suggestion FROM AiSuggestionEntity suggestion
            JOIN CandidateEntity candidate ON candidate.id = suggestion.candidateId
            JOIN JobEntity job ON job.id = suggestion.jobId
            WHERE suggestion.id = :suggestionId
              AND suggestion.jobId = :jobId
              AND suggestion.companyId = :companyId
              AND candidate.company.id = :companyId
              AND (candidate.isDeleted IS NULL OR candidate.isDeleted = false)
              AND job.company.id = :companyId
              AND (job.isDeleted IS NULL OR job.isDeleted = false)
            """)
    Optional<AiSuggestionEntity> findForContactForUpdate(
            @Param("suggestionId") Long suggestionId,
            @Param("jobId") Long jobId,
            @Param("companyId") Long companyId
    );

    Optional<AiSuggestionEntity> findByIdAndJobIdAndCompanyId(Long id, Long jobId, Long companyId);

    void deleteByJobIdAndCompanyId(Long jobId, Long companyId);
}
