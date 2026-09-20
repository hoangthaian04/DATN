package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BasePagination;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.CreateJobCategoryRequestDTO;
import EazyTech.EazyHire.models.dtos.ReorderJobCategoriesRequestDTO;
import EazyTech.EazyHire.models.dtos.UpdateJobCategoryRequestDTO;
import EazyTech.EazyHire.services.JobCategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.security.access.prepost.PreAuthorize;

@RestController
@RequestMapping("/api/v1/admin/job-categories")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminJobCategoriesController {

    private final JobCategoryService categoryService;

    @GetMapping
    public BaseResponse getCategories(
            @RequestParam(defaultValue = "1") @Positive Integer page,
            @RequestParam(required = false) @Positive Integer limit,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String searchText
    ) {
        int pageSize = limit != null ? limit : 10;
        String keyword = search != null ? search : searchText;
        return BaseResponse.success(
                "Lấy danh sách danh mục ngành nghề thành công.",
                new BasePagination<>(categoryService.getCategories(keyword, page, pageSize))
        );
    }

    @PostMapping
    public BaseResponse createCategory(@Valid @RequestBody CreateJobCategoryRequestDTO request) {
        return BaseResponse.success(
                "Tạo danh mục thành công.",
                categoryService.createCategory(request, currentAdminId())
        );
    }

    @PutMapping("/{id}")
    public BaseResponse updateCategory(
            @PathVariable @Positive Long id,
            @Valid @RequestBody UpdateJobCategoryRequestDTO request
    ) {
        return BaseResponse.success(
                "Cập nhật danh mục thành công.",
                categoryService.updateCategory(id, request, currentAdminId())
        );
    }

    @PutMapping("/reorder")
    public BaseResponse reorderCategories(@Valid @RequestBody ReorderJobCategoriesRequestDTO request) {
        return BaseResponse.success(
                "Sắp xếp danh mục thành công.",
                categoryService.reorderCategories(request, currentAdminId())
        );
    }

    @DeleteMapping("/{id}")
    public BaseResponse deleteCategory(@PathVariable @Positive Long id) {
        categoryService.deleteCategory(id, currentAdminId());
        return BaseResponse.success("Đã xóa danh mục thành công.");
    }

    private Long currentAdminId() {
        AuthorizedUser admin = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        return admin.getId();
    }
}
