package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.*;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.*;
import EazyTech.EazyHire.models.enums.EmailTemplateType;
import EazyTech.EazyHire.services.EmailTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController @RequestMapping("/api/v1/email-templates") @RequiredArgsConstructor
public class EmailTemplateController {
    private final EmailTemplateService service;
    @GetMapping public ResponseEntity<BaseResponse> list(@RequestParam(required = false) String keyword, @RequestParam(required = false) EmailTemplateType type, @RequestParam(defaultValue = "false") boolean activeOnly, @RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(BaseResponse.success("Lấy danh sách Email Template thành công", service.getTemplates(user().getCompanyId(), keyword, type, activeOnly, page, size)));
    }
    @PostMapping public ResponseEntity<BaseResponse> create(@Valid @RequestBody EmailTemplateCreateRequestDTO request) {
        AuthorizedUser user = user(); return ResponseEntity.status(HttpStatus.CREATED).body(BaseResponse.success("Tạo Email Template thành công", service.create(user.getCompanyId(), user.getId(), request)));
    }
    @PatchMapping("/{templateId}") public ResponseEntity<BaseResponse> update(@PathVariable Long templateId, @Valid @RequestBody EmailTemplateUpdateRequestDTO request) {
        AuthorizedUser user = user(); return ResponseEntity.ok(BaseResponse.success("Cập nhật Email Template thành công", service.update(user.getCompanyId(), user.getId(), templateId, request)));
    }
    @DeleteMapping("/{templateId}") public ResponseEntity<BaseResponse> delete(@PathVariable Long templateId) {
        AuthorizedUser user = user(); service.delete(user.getCompanyId(), user.getId(), templateId); return ResponseEntity.ok(BaseResponse.success("Xóa Email Template thành công"));
    }
    private AuthorizedUser user() { return SecurityUtils.getCurrentUser().orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập")); }
}
