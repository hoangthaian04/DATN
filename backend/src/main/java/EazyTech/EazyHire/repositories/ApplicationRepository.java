package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO;

@Repository
public interface ApplicationRepository extends JpaRepository<ApplicationEntity, Long> {

    List<ApplicationEntity> findByCompanyIdAndCreatedAtBetween(Long companyId,LocalDateTime start,LocalDateTime end);

    boolean existsByJobIdAndCurrentRoundId(Long jobId, Long currentRoundId);


    Long countByCompanyIdAndStatusAndCreatedAtBetween(
            Long companyId, String status, LocalDateTime startDate, LocalDateTime endDate);

    Long countByCompanyIdAndCreatedAtBetween(
            Long companyId, LocalDateTime startDate, LocalDateTime endDate);

    @Query(value = "SELECT TO_CHAR(a.createdAt, 'YYYY-MM-DD') as date, COUNT(a.id) as count " +
            "FROM ApplicationEntity a " +
            "WHERE a.company.id = :companyId AND a.createdAt BETWEEN :startDate AND :endDate " +
            "GROUP BY TO_CHAR(a.createdAt, 'YYYY-MM-DD') " +
            "ORDER BY date ASC")
    List<Object[]> getApplicationChartData(
            @Param("companyId") Long companyId,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate);
            
    // Fetch NEW applications for Todo list
    List<ApplicationEntity> findTop5ByCompanyIdAndStatusOrderByCreatedAtDesc(Long companyId, String status);

    @Query("SELECT new EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO(" +
           "a.id, c.id, c.fullName, j.title, c.phone, c.email, a.status) " +
           "FROM ApplicationEntity a " +
           "JOIN a.candidate c " +
           "JOIN a.job j " +
           "WHERE (:jobId IS NULL OR j.id = :jobId) AND a.company.id = :companyId " +
           "AND (:status IS NULL OR a.status = :status)")
    Page<ApplicationListResponseDTO> findApplicationsForListView(
            @Param("jobId") Long jobId, 
            @Param("companyId") Long companyId, 
            @Param("status") String status, 
            Pageable pageable);
}
