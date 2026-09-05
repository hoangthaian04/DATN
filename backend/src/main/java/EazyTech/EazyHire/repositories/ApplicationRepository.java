package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.ApplicationEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ApplicationRepository extends JpaRepository<ApplicationEntity, Long> {

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
}
