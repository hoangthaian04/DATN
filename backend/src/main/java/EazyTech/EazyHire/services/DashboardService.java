package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.dashboard.DashboardOverviewResponseDTO;

public interface DashboardService {
    DashboardOverviewResponseDTO getOverview(Long companyId, String range);
}
