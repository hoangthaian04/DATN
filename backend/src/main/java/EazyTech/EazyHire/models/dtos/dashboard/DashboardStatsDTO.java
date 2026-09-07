package EazyTech.EazyHire.models.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    private Long totalActiveJobs;
    private Long newApplications;
    private Long upcomingInterviews;
    private Double hireRate;
}
