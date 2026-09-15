package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.JobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import EazyTech.EazyHire.models.dtos.JobListResponseDTO;
import EazyTech.EazyHire.models.dtos.JobStatsResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicJobSummaryResponseDTO;
import EazyTech.EazyHire.models.dtos.dashboard.TopJobDTO;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {

    List<JobEntity> findByCompanyIdAndIsDeletedFalse(Long companyId);

    boolean existsByCompanyIdAndSlug(Long companyId, String slug);

    @Query("SELECT COUNT(j) FROM JobEntity j WHERE j.category.id = :categoryId AND j.isDeleted = false")
    long countByCategoryIdAndIsDeletedFalse(@Param("categoryId") Long categoryId);

    Long countByCompanyIdAndStatusAndIsDeletedFalseAndCreatedAtBetween(
            Long companyId, String status, LocalDateTime startDate, LocalDateTime endDate);

    @Query(
        "SELECT new EazyTech.EazyHire.models.dtos.dashboard.TopJobDTO(j.title, 'Department', j.location, count(a), j.status) " +
        "FROM JobEntity j LEFT JOIN ApplicationEntity a ON j.id = a.job.id " +
        "WHERE j.company.id = :companyId " +
        "AND j.isDeleted = false " +
        "GROUP BY j.id, j.title, j.location, j.status " +
        "ORDER BY count(a) DESC LIMIT 4"
    )
    List<TopJobDTO> findTopJobsByCompanyId(@Param("companyId") Long companyId);

    @Query(
        "SELECT new EazyTech.EazyHire.models.dtos.JobListResponseDTO(" +
        "j.id, j.title, j.location, j.employmentType, j.roundCount, j.status, count(a), j.publishedAt, j.createdAt) " +
        "FROM JobEntity j LEFT JOIN ApplicationEntity a ON j.id = a.job.id " +
        "WHERE j.company.id = :companyId " +
        "AND (:keyword = '' OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
        "AND (:status = '' OR j.status = :status) " +
        "AND j.isDeleted = false " +
        "GROUP BY j.id " +
        "ORDER BY j.createdAt DESC"
    )
    Page<JobListResponseDTO> findJobsByFilter(
        @Param("companyId") Long companyId, 
        @Param("keyword") String keyword, 
        @Param("status") String status, 
        Pageable pageable
    );

    @Query("""
        SELECT new EazyTech.EazyHire.models.dtos.PublicJobSummaryResponseDTO(
            j.id, j.title, j.slug, j.location, j.workingType, j.employmentType,
            j.salaryMin, j.salaryMax, j.currency, category.name, category.slug, j.publishedAt
        )
        FROM JobEntity j
        JOIN j.company company
        LEFT JOIN j.category category
        WHERE company.slug = :companySlug
          AND company.status = EazyTech.EazyHire.models.enums.CompanyStatus.ACTIVE
          AND j.status = 'ACTIVE'
          AND j.isDeleted = false
          AND (:keyword = ''
               OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%'))
               OR LOWER(COALESCE(j.description, '')) LIKE LOWER(CONCAT('%', :keyword, '%')))
          AND (:location = ''
               OR LOWER(COALESCE(j.location, '')) LIKE LOWER(CONCAT('%', :location, '%')))
          AND (:categorySlug = ''
               OR (category.slug = :categorySlug
                   AND category.status = EazyTech.EazyHire.models.enums.JobCategoryStatus.ACTIVE
                   AND category.isDeleted = false))
        ORDER BY CASE WHEN j.publishedAt IS NULL THEN 1 ELSE 0 END,
                 j.publishedAt DESC, j.createdAt DESC, j.id DESC
        """)
    Page<PublicJobSummaryResponseDTO> findPublicJobs(
            @Param("companySlug") String companySlug,
            @Param("keyword") String keyword,
            @Param("location") String location,
            @Param("categorySlug") String categorySlug,
            Pageable pageable
    );

    @Query("""
        SELECT j
        FROM JobEntity j
        JOIN FETCH j.company company
        LEFT JOIN FETCH j.category category
        WHERE company.slug = :companySlug
          AND company.status = EazyTech.EazyHire.models.enums.CompanyStatus.ACTIVE
          AND j.slug = :jobSlug
          AND j.status = 'ACTIVE'
          AND j.isDeleted = false
        """)
    Optional<JobEntity> findPublicJob(
            @Param("companySlug") String companySlug,
            @Param("jobSlug") String jobSlug
    );

    @Query(
        "SELECT new EazyTech.EazyHire.models.dtos.JobStatsResponseDTO(" +
        "COUNT(j), " +
        "SUM(CASE WHEN j.status = 'ACTIVE' THEN 1L ELSE 0L END), " +
        "SUM(CASE WHEN j.status = 'INACTIVE' THEN 1L ELSE 0L END), " +
        "SUM(CASE WHEN j.status = 'CLOSED' THEN 1L ELSE 0L END)) " +
        "FROM JobEntity j " +
        "WHERE j.company.id = :companyId AND j.isDeleted = false"
    )
    JobStatsResponseDTO getJobStatsByCompanyId(@Param("companyId") Long companyId);

}
