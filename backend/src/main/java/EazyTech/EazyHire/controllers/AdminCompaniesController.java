package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
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
        return new BaseResponse(companyService.getCompanies(request));
    }

    @GetMapping("/{id}")
    public BaseResponse getCompanyDetail(@PathVariable Long id) {
        return new BaseResponse(companyService.getCompanyDetail(id));
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
