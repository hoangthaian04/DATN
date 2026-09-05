package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.models.dtos.dashboard.DashboardOverviewResponseDTO;
import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.services.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/dashboards")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/overview")
    public ResponseEntity<BaseResponse> getOverview(
            @AuthenticationPrincipal AuthorizedUser userPrincipal,
            @RequestParam(defaultValue = "30d") String range) {
        
        Long companyId = userPrincipal.getCompanyId();
        DashboardOverviewResponseDTO response = dashboardService.getOverview(companyId, range);
        
        return ResponseEntity.ok(BaseResponse.success(response));
    }
}
