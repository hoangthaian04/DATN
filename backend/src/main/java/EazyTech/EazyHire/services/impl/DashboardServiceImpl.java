package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.models.dtos.dashboard.ChartDataDTO;
import EazyTech.EazyHire.models.dtos.dashboard.DashboardOverviewResponseDTO;
import EazyTech.EazyHire.models.dtos.dashboard.TopStatsDTO;
import EazyTech.EazyHire.models.dtos.dashboard.EffectivenessDTO;
import EazyTech.EazyHire.models.dtos.dashboard.TopJobDTO;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.InterviewEntity;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.InterviewRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final InterviewRepository interviewRepository;

    @Override
    public DashboardOverviewResponseDTO getOverview(Long companyId, String range) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startDate;

        switch (range) {
            case "7d":
                startDate = now.minusDays(7);
                break;
            case "this_month":
                startDate = YearMonth.now().atDay(1).atStartOfDay();
                break;
            case "this_year":
                startDate = LocalDate.now().withDayOfYear(1).atStartOfDay();
                break;
            case "30d":
            default:
                startDate = now.minusDays(30);
                break;
        }

        // 1. Calculate Top Stats
        Long totalApplications = applicationRepository.countByCompanyIdAndCreatedAtBetween(companyId, startDate, now);
        
        Long processingApplications = applicationRepository.countByCompanyIdAndStatusAndCreatedAtBetween(
                companyId, "ACTIVE", startDate, now); // Assuming 'ACTIVE' is processing. Could be NEW/SCREENING etc.
        
        Long passedApplications = applicationRepository.countByCompanyIdAndStatusAndCreatedAtBetween(
                companyId, "HIRED", startDate, now);
                
        Long failedApplications = applicationRepository.countByCompanyIdAndStatusAndCreatedAtBetween(
                companyId, "REJECTED", startDate, now);

        TopStatsDTO stats = TopStatsDTO.builder()
                .totalApplicants(totalApplications != null ? totalApplications : 0L)
                .processingApplicants(processingApplications != null ? processingApplications : 0L)
                .passedApplicants(passedApplications != null ? passedApplications : 0L)
                .failedApplicants(failedApplications != null ? failedApplications : 0L)
                .build();

        // 2. Fetch Chart Data
        List<Object[]> chartQueryResults = applicationRepository.getApplicationChartData(companyId, startDate, now);
        List<ChartDataDTO> chartData = new ArrayList<>();
        if (chartQueryResults != null) {
            for (Object[] row : chartQueryResults) {
                chartData.add(new ChartDataDTO((String) row[0], ((Number) row[1]).longValue()));
            }
        }

        // 3. Effectiveness (Simplified logic for MVP)
        Double conversionRate = totalApplications != null && totalApplications > 0 
                                ? (passedApplications != null ? passedApplications : 0) * 100.0 / totalApplications : 0.0;
        
        EffectivenessDTO effectiveness = EffectivenessDTO.builder()
                .conversionRate(Math.round(conversionRate * 10.0) / 10.0)
                .avgHireTimeDays(21.0) // Mocked logic as calculating actual diff in JPQL requires native query
                .topSource("Website")
                .offerAcceptanceRate(92.0)
                .build();

        // 4. Fetch Top Jobs
        List<TopJobDTO> topJobs = jobRepository.findTopJobsByCompanyId(companyId);

        return DashboardOverviewResponseDTO.builder()
                .stats(stats)
                .effectiveness(effectiveness)
                .chartData(chartData)
                .topJobs(topJobs)
                .build();
    }
}
