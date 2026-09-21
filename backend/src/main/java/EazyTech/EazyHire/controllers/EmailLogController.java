package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.enums.EmailLogStatus;
import EazyTech.EazyHire.services.EmailLogService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/email-logs")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
public class EmailLogController {
    private final EmailLogService service;

    @GetMapping
    public ResponseEntity<BaseResponse> list(
            @RequestParam(required = false) EmailLogStatus status,
            @RequestParam(required = false) String templateCode,
            @Valid PaginationRequest paginationRequest
    ) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(new BaseResponse(service.list(
                user.getCompanyId(), status, templateCode, paginationRequest
        )));
    }

    @GetMapping("/{logId}")
    public ResponseEntity<BaseResponse> get(@PathVariable Long logId) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy chi tiết lịch sử email thành công", service.get(user.getCompanyId(), logId)
        ));
    }

    @PostMapping("/{logId}/retry")
    public ResponseEntity<BaseResponse> retry(@PathVariable Long logId) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Gửi lại email thành công", service.retry(user.getCompanyId(), user.getId(), logId)
        ));
    }

    private AuthorizedUser currentUser() {
        return SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
    }
}
