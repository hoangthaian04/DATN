package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.InterviewEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<InterviewEntity, Long> {

    Long countByCompanyIdAndStatusAndInterviewTimeBetween(
            Long companyId, String status, LocalDateTime startDate, LocalDateTime endDate);

    // Fetch upcoming scheduled interviews for Todo list
    List<InterviewEntity> findTop5ByCompanyIdAndStatusAndInterviewTimeBetweenOrderByInterviewTimeAsc(
            Long companyId, String status, LocalDateTime startDate, LocalDateTime endDate);

    // Fetch rejected/reschedule requested interviews for Todo list
    List<InterviewEntity> findTop5ByCompanyIdAndStatusInOrderByUpdatedAtDesc(
            Long companyId, List<String> statuses);
}
