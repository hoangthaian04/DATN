package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO;

@Repository
public interface ApplicationRepository extends JpaRepository<ApplicationEntity, Long> {

    List<ApplicationEntity> findByCompanyIdAndCreatedAtBetween(Long companyId,LocalDateTime start,LocalDateTime end);

    boolean existsByJobIdAndCurrentRoundId(Long jobId, Long currentRoundId);


    // Fetch NEW applications for Todo list
    List<ApplicationEntity> findTop5ByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, String status);

    @Query("SELECT new EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO(" +
           "a.id, c.id, c.fullName, j.title, c.phone, c.email, a.status) " +
           "FROM ApplicationEntity a " +
           "JOIN a.candidate c " +
           "JOIN a.job j " +
           "WHERE (:jobId IS NULL OR j.id = :jobId) AND a.company.id = :companyId " +
           "AND (:status IS NULL OR :status = '' OR a.status = :status) " +
           "AND (:keyword IS NULL OR :keyword = '' " +
           "OR LOWER(c.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(c.email) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(COALESCE(c.phone, '')) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<ApplicationListResponseDTO> findApplicationsForListView(
            @Param("jobId") Long jobId, 
            @Param("companyId") Long companyId, 
            @Param("status") String status,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query("SELECT COUNT(a) FROM ApplicationEntity a " +
           "WHERE a.job.id = :jobId AND a.company.id = :companyId")
    long countByJobIdAndCompanyId(@Param("jobId") Long jobId, @Param("companyId") Long companyId);

    Optional<ApplicationEntity> findByJobIdAndCandidateIdAndStatus(
            Long jobId,
            Long candidateId,
            String status
    );

    Optional<ApplicationEntity> findBySecureToken(String secureToken);

    @Query("""
            SELECT a FROM ApplicationEntity a
            JOIN a.company company
            JOIN a.candidate candidate
            WHERE LOWER(company.slug) = LOWER(:companySlug)
              AND LOWER(candidate.email) = LOWER(:email)
              AND a.status = :status
              AND (candidate.isDeleted IS NULL OR candidate.isDeleted = false)
            ORDER BY a.appliedAt DESC
            """)
    List<ApplicationEntity> findByCompanySlugAndCandidateEmailAndStatus(
            @Param("companySlug") String companySlug,
            @Param("email") String email,
            @Param("status") String status
    );
}
