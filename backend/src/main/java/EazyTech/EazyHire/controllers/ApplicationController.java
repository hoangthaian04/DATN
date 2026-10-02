package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO;
import EazyTech.EazyHire.models.dtos.CvFileContent;
import EazyTech.EazyHire.models.dtos.CvAnalysisRequestDTO;
import EazyTech.EazyHire.models.dtos.CvAnalysisResponseDTO;
import EazyTech.EazyHire.services.ApplicationService;
import EazyTech.EazyHire.services.CvAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1/applications")
@RequiredArgsConstructor
public class ApplicationController {

    private final ApplicationService applicationService;
    private final CvAnalysisService cvAnalysisService;

    @GetMapping
    public ResponseEntity<BaseResponse> getApplications(
            @RequestParam(required = false) Long jobId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @Valid PaginationRequest paginationRequest
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        
        Page<ApplicationListResponseDTO> applicationsPage = applicationService.getApplicationsForJob(
                user.getCompanyId(), jobId, status, keyword, paginationRequest
        );

        return ResponseEntity.ok(new BaseResponse(applicationsPage));
    }

    @GetMapping(value = "/{applicationId}/cv", produces = MediaType.APPLICATION_PDF_VALUE)
    @PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
    public ResponseEntity<byte[]> getCv(@PathVariable Long applicationId) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        CvFileContent cv = applicationService.getCv(applicationId, user.getCompanyId());

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentLength(cv.content().length);
        headers.setContentDisposition(ContentDisposition.inline()
                .filename(cv.filename(), StandardCharsets.UTF_8)
                .build());
        headers.setCacheControl(CacheControl.noStore());
        headers.set("X-Content-Type-Options", "nosniff");
        return ResponseEntity.ok().headers(headers).body(cv.content());
    }

    @PostMapping("/{applicationId}/cv-analysis")
    @PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
    public ResponseEntity<BaseResponse> analyzeCv(
            @PathVariable Long applicationId,
            @RequestBody(required = false) CvAnalysisRequestDTO request
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        CvAnalysisResponseDTO analysis = cvAnalysisService.analyze(
                applicationId,
                user.getCompanyId(),
                request == null ? CvAnalysisRequestDTO.builder().rerun(false).build() : request
        );
        return ResponseEntity.ok(new BaseResponse(1, "Phân tích CV thành công", analysis));
    }

    @GetMapping("/{applicationId}/cv-analysis")
    @PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
    public ResponseEntity<BaseResponse> getLatestCvAnalysis(@PathVariable Long applicationId) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        Optional<CvAnalysisResponseDTO> analysis = cvAnalysisService.getLatest(
                applicationId,
                user.getCompanyId()
        );
        return ResponseEntity.ok(BaseResponse.success(
                analysis.isPresent() ? "Lấy phân tích CV mới nhất thành công" : "Ứng viên chưa có kết quả AI",
                analysis.orElse(null)
        ));
    }
}
