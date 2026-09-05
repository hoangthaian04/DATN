package EazyTech.EazyHire.models.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardOverviewResponseDTO {
    private TopStatsDTO stats;
    private EffectivenessDTO effectiveness;
    private List<ChartDataDTO> chartData;
    private List<TopJobDTO> topJobs;
}
