package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.FormFieldRequestDTO;
import EazyTech.EazyHire.models.dtos.ReorderFormFieldsRequestDTO;
import EazyTech.EazyHire.services.FormFieldService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/jobs/{jobId}/form-fields")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
public class FormFieldController {

    private final FormFieldService formFieldService;

    @GetMapping
    public ResponseEntity<BaseResponse> getFormFields(@PathVariable Long jobId) {
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy danh sách field form thành công",
                formFieldService.getFormFields(jobId, currentUser().getCompanyId())
        ));
    }

    @PostMapping
    public ResponseEntity<BaseResponse> createFormField(
            @PathVariable Long jobId,
            @Valid @RequestBody FormFieldRequestDTO request
    ) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Tạo field form thành công",
                formFieldService.createFormField(jobId, user.getCompanyId(), user.getId(), request)
        ));
    }

    @PutMapping("/reorder")
    public ResponseEntity<BaseResponse> reorderFormFields(
            @PathVariable Long jobId,
            @Valid @RequestBody ReorderFormFieldsRequestDTO request
    ) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Sắp xếp field form thành công",
                formFieldService.reorderFormFields(jobId, user.getCompanyId(), user.getId(), request.getOrderedIds())
        ));
    }

    @PutMapping("/{fieldId}")
    public ResponseEntity<BaseResponse> updateFormField(
            @PathVariable Long jobId,
            @PathVariable Long fieldId,
            @Valid @RequestBody FormFieldRequestDTO request
    ) {
        AuthorizedUser user = currentUser();
        return ResponseEntity.ok(BaseResponse.success(
                "Cập nhật field form thành công",
                formFieldService.updateFormField(jobId, fieldId, user.getCompanyId(), user.getId(), request)
        ));
    }

    @DeleteMapping("/{fieldId}")
    public ResponseEntity<BaseResponse> deleteFormField(
            @PathVariable Long jobId,
            @PathVariable Long fieldId
    ) {
        AuthorizedUser user = currentUser();
        formFieldService.deleteFormField(jobId, fieldId, user.getCompanyId(), user.getId());
        return ResponseEntity.ok(BaseResponse.success("Xóa field form thành công"));
    }

    private AuthorizedUser currentUser() {
        return SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
    }
}
