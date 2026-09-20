package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BasePagination;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.AdminUserFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.AdminUserStatusRequestDTO;
import EazyTech.EazyHire.services.AdminUserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUsersController {
    private final AdminUserService adminUserService;

    @GetMapping
    public BaseResponse getUsers(@Valid @ModelAttribute AdminUserFilterRequestDTO request) {
        return BaseResponse.success(
                "Lấy danh sách người dùng thành công.",
                new BasePagination<>(adminUserService.getUsers(request))
        );
    }

    @GetMapping("/{id}")
    public BaseResponse getUser(@PathVariable @Positive Long id) {
        return BaseResponse.success(
                "Lấy chi tiết người dùng thành công.",
                adminUserService.getUser(id)
        );
    }

    @PatchMapping("/{id}/status")
    public BaseResponse changeStatus(
            @PathVariable @Positive Long id,
            @Valid @RequestBody AdminUserStatusRequestDTO request
    ) {
        AuthorizedUser admin = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        adminUserService.changeStatus(id, admin.getId(), request);
        String message = request.getStatus().name().equals("INACTIVE")
                ? "Đã vô hiệu hóa tài khoản và thu hồi các phiên đăng nhập"
                : "Đã kích hoạt lại tài khoản";
        return BaseResponse.success(message);
    }
}
