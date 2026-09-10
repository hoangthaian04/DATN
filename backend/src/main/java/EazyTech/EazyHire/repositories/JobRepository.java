package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.JobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import EazyTech.EazyHire.models.dtos.JobListResponseDTO;
import EazyTech.EazyHire.models.dtos.JobStatsResponseDTO;
import EazyTech.EazyHire.models.dtos.dashboard.TopJobDTO;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {

    List<JobEntity> findByCompanyIdAndIsDeletedFalse(Long companyId);
    
    boolean existsByIdAndCompanyId(Long id, Long companyId);
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
        "j.id, j.title, j.location, j.employmentType, j.status, count(a), j.publishedAt, j.createdAt) " +
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
