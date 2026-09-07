package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.JobEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import EazyTech.EazyHire.models.dtos.dashboard.TopJobDTO;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<JobEntity, Long> {

    List<JobEntity> findByCompanyIdAndIsDeletedFalse(Long companyId);
    Long countByCompanyIdAndStatusAndIsDeletedFalseAndCreatedAtBetween(
            Long companyId, String status, LocalDateTime startDate, LocalDateTime endDate);

    @Query(
        "SELECT new EazyTech.EazyHire.models.dtos.dashboard.TopJobDTO(j.title, 'Department', j.location, count(a), j.status) " +
        "FROM JobEntity j LEFT JOIN ApplicationEntity a ON j.id = a.job.id " +
        "WHERE j.company.id = :companyId " +
        "GROUP BY j.id, j.title, j.location, j.status " +
        "ORDER BY count(a) DESC LIMIT 4"
    )
    List<TopJobDTO> findTopJobsByCompanyId(@Param("companyId") Long companyId);

}
