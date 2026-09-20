package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BasePagination;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.models.dtos.AuditLogFilterRequestDTO;
import EazyTech.EazyHire.services.AuditLogService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminAuditLogsController {
    private final AuditLogService auditLogService;

    @GetMapping
    public BaseResponse getLogs(@Valid @ModelAttribute AuditLogFilterRequestDTO request) {
        return BaseResponse.success(
                "Lấy danh sách audit logs thành công.",
                new BasePagination<>(auditLogService.getLogs(request))
        );
    }

    @GetMapping("/{id}")
    public BaseResponse getLog(@PathVariable @Positive Long id) {
        return BaseResponse.success(
                "Lấy chi tiết audit log thành công.",
                auditLogService.getLog(id)
        );
    }
}
