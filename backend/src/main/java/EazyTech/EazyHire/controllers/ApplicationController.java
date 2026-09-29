package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO;
import EazyTech.EazyHire.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import EazyTech.EazyHire.models.dtos.ApplicationDetailResponseDTO;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;

    @GetMapping
    public ResponseEntity<BaseResponse> getApplications(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String status,
            @Valid PaginationRequest paginationRequest
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        
        Page<ApplicationListResponseDTO> applicationsPage = applicationService.getApplicationsForJob(
                user.getCompanyId(), jobId, status, paginationRequest
        );

        return ResponseEntity.ok(new BaseResponse(applicationsPage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BaseResponse> getApplicationDetail(@PathVariable Long id) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));

        ApplicationDetailResponseDTO detail = applicationService.getApplicationDetail(user.getCompanyId(), id);
        return ResponseEntity.ok(BaseResponse.success("Lấy chi tiết hồ sơ ứng tuyển thành công", detail));
    }

    @PutMapping("/{id}/round")
    public ResponseEntity<BaseResponse> updateApplicationRound(
            @PathVariable Long id,
            @RequestParam(required = false) Long targetRoundId,
            @RequestParam(required = false) String status
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));

        ApplicationListResponseDTO updated = applicationService.updateApplicationRound(
                user.getCompanyId(), id, targetRoundId, status
        );

        return ResponseEntity.ok(BaseResponse.success("Cập nhật vòng tuyển dụng thành công", updated));
    }
}
