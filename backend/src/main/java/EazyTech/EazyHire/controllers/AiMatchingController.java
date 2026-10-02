package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.AiMatchingContactRequestDTO;
import EazyTech.EazyHire.models.dtos.AiMatchingTriggerRequestDTO;
import EazyTech.EazyHire.services.AiMatchingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/jobs/{jobId}")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
public class AiMatchingController {

    private final AiMatchingService aiMatchingService;

    @PostMapping("/ai-matching/trigger")
    public ResponseEntity<BaseResponse> trigger(
            @PathVariable Long jobId,
            @Valid @RequestBody(required = false) AiMatchingTriggerRequestDTO request
    ) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(BaseResponse.success(
                "Đã tiếp nhận yêu cầu chạy AI Matching.",
                aiMatchingService.trigger(jobId, user.getCompanyId(), user.getId(), request)
        ));
    }

    @GetMapping("/ai-matching/status")
    public ResponseEntity<BaseResponse> latestRun(@PathVariable Long jobId) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy trạng thái AI Matching thành công.",
                aiMatchingService.getLatestRun(jobId, user.getCompanyId())
        ));
    }

    @GetMapping("/ai-suggestions")
    public ResponseEntity<BaseResponse> list(@PathVariable Long jobId) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy danh sách ứng viên AI gợi ý thành công.",
                aiMatchingService.listSuggestions(jobId, user.getCompanyId())
        ));
    }

    @GetMapping("/ai-suggestions/{suggestionId}/contact-template")
    public ResponseEntity<BaseResponse> contactTemplate(
            @PathVariable Long jobId,
            @PathVariable Long suggestionId
    ) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy mẫu email mời ứng tuyển thành công.",
                aiMatchingService.getContactTemplate(jobId, suggestionId, user.getCompanyId())
        ));
    }

    @PostMapping("/ai-suggestions/{suggestionId}/contact")
    public ResponseEntity<BaseResponse> contact(
            @PathVariable Long jobId,
            @PathVariable Long suggestionId,
            @Valid @RequestBody AiMatchingContactRequestDTO request
    ) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Đã gửi lời mời ứng tuyển.",
                aiMatchingService.contact(jobId, suggestionId, user.getCompanyId(), user.getId(), request)
        ));
    }

    private AuthorizedUser currentUser() {
        return SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
    }
}
