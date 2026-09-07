package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.BasePagination;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.CompanyFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.RejectCompanyRequestDTO;
import EazyTech.EazyHire.services.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import EazyTech.EazyHire.models.dtos.CompanyStatusRequestDTO;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/companies")
@RequiredArgsConstructor
public class AdminCompaniesController {

    private final CompanyService companyService;

    @GetMapping
    public BaseResponse getCompanies(@Valid @ModelAttribute CompanyFilterRequestDTO request) {
        return BaseResponse.success(
                "Lấy danh sách doanh nghiệp thành công",
                new BasePagination<>(companyService.getCompanies(request))
        );
    }

    @GetMapping("/{id}")
    public BaseResponse getCompanyDetail(@PathVariable Long id) {
        return BaseResponse.success(
                "Lấy chi tiết doanh nghiệp thành công",
                companyService.getCompanyDetail(id)
        );
    }

    @PatchMapping("/{id}/status")
    public BaseResponse changeCompanyStatus(
            @PathVariable Long id,
            @Valid @RequestBody CompanyStatusRequestDTO request
    ) {
        AuthorizedUser admin = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));

        String message = switch (request.getStatus()) {
            case ACTIVE -> "Phê duyệt doanh nghiệp thành công";
            case REJECTED -> "Từ chối doanh nghiệp thành công";
            case BLOCKED -> "Khóa doanh nghiệp thành công";
            default -> "Cập nhật trạng thái doanh nghiệp thành công";
        };
        return BaseResponse.success(message, companyService.changeStatus(id, admin.getId(), request));
    }

    @PutMapping("/{id}/approve")
    public BaseResponse approveCompany(@PathVariable Long id) {
        AuthorizedUser admin = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));

        return new BaseResponse(companyService.approveCompany(id, admin.getId()));
    }

    @PutMapping("/{id}/reject")
    public BaseResponse rejectCompany(
            @PathVariable Long id,
            @Valid @RequestBody RejectCompanyRequestDTO request
    ) {
        AuthorizedUser admin = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));

        return new BaseResponse(companyService.rejectCompany(id, admin.getId(), request.getReason()));
    }

    @PutMapping("/{id}/block")
    public BaseResponse blockCompany(@PathVariable Long id) {
        AuthorizedUser admin = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));

        return new BaseResponse(companyService.blockCompany(id, admin.getId()));
    }
}
