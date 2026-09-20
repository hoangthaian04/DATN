package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.services.JobCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Internal catalog used by HR Job forms; Admin management stays under /admin/job-categories. */
@RestController
@RequestMapping("/api/v1/job-categories")
@RequiredArgsConstructor
public class JobCategoriesController {

    private final JobCategoryService categoryService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_ADMIN', 'HR')")
    public ResponseEntity<BaseResponse> getActiveOptions() {
        currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy danh sách danh mục đang hoạt động thành công",
                categoryService.getActiveOptions()
        ));
    }

    private AuthorizedUser currentUser() {
        return SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
    }
}
