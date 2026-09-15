package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.models.dtos.JobListResponseDTO;
import EazyTech.EazyHire.models.dtos.JobStatsResponseDTO;
import EazyTech.EazyHire.models.dtos.JobDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.CreateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.UpdateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.SaveJobPipelineRequestDTO;
import EazyTech.EazyHire.services.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/jobs")
@RequiredArgsConstructor
public class JobController {

    private final JobService jobService;

    @PostMapping
    @PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
    public ResponseEntity<BaseResponse> createJob(
            @Valid @RequestBody CreateJobRequestDTO request
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        JobDetailResponseDTO createdJob = jobService.createJob(request, user.getCompanyId(), user.getId());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new BaseResponse(1, "Tạo job thành công", createdJob));
    }

    @PostMapping("/{jobId}/publish")
    @PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
    public ResponseEntity<BaseResponse> publishJob(@PathVariable Long jobId) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(new BaseResponse(
                1,
                "Publish job thành công",
                jobService.publishJob(jobId, user.getCompanyId(), user.getId())
        ));
    }

    @PostMapping("/{jobId}/close")
    @PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
    public ResponseEntity<BaseResponse> closeJob(@PathVariable Long jobId) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(new BaseResponse(
                1,
                "Đóng job thành công",
                jobService.closeJob(jobId, user.getCompanyId(), user.getId())
        ));
    }

    @PostMapping("/{jobId}/reopen")
    @PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
    public ResponseEntity<BaseResponse> reopenJob(@PathVariable Long jobId) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(new BaseResponse(
                1,
                "Mở lại job thành công",
                jobService.reopenJob(jobId, user.getCompanyId(), user.getId())
        ));
    }

    @GetMapping
    public ResponseEntity<BaseResponse> getJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String status,
            @Valid PaginationRequest paginationRequest
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        
        Page<JobListResponseDTO> jobs = jobService.getJobs(user.getCompanyId(), keyword, status, paginationRequest);
        return ResponseEntity.ok(new BaseResponse(jobs));
    }

    @GetMapping("/stats")
    public ResponseEntity<BaseResponse> getJobStats() {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        
        JobStatsResponseDTO stats = jobService.getJobStats(user.getCompanyId());
        return ResponseEntity.ok(new BaseResponse(1, "Thống kê job thành công", stats));
    }

    @GetMapping("/{jobId}")
    public ResponseEntity<BaseResponse> getJobById(@PathVariable Long jobId) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        
        JobDetailResponseDTO job = jobService.getJobById(jobId, user.getCompanyId());
        return ResponseEntity.ok(new BaseResponse(1, "Lấy chi tiết job thành công", job));
    }

    @PutMapping("/{jobId}")
    public ResponseEntity<BaseResponse> updateJob(
            @PathVariable Long jobId,
            @Valid @RequestBody UpdateJobRequestDTO request
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        
        JobDetailResponseDTO updatedJob = jobService.updateJob(jobId, request, user.getCompanyId());
        return ResponseEntity.ok(new BaseResponse(1, "Cập nhật job thành công", updatedJob));
    }

    @PutMapping("/{jobId}/pipeline")
    public ResponseEntity<BaseResponse> saveJobPipeline(
            @PathVariable Long jobId,
            @Valid @RequestBody SaveJobPipelineRequestDTO request
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        JobDetailResponseDTO updatedJob = jobService.saveJobPipeline(jobId, request, user.getCompanyId());
        return ResponseEntity.ok(new BaseResponse(1, "Lưu tin tuyển dụng và pipeline thành công", updatedJob));
    }

    @DeleteMapping("/{jobId}")
    public ResponseEntity<BaseResponse> deleteJob(@PathVariable Long jobId) {
        AuthorizedUser user = currentUser();
        
        jobService.deleteJob(jobId, user.getCompanyId());
        return ResponseEntity.ok(new BaseResponse(1, "Xóa job thành công", null));
    }

    private AuthorizedUser currentUser() {
        return SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
    }
}
