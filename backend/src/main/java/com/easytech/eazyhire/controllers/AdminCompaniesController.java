package com.easytech.eazyhire.controllers;

import com.easytech.eazyhire.core.AuthorizedUser;
import com.easytech.eazyhire.core.BaseResponse;
import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.core.utils.SecurityUtils;
import com.easytech.eazyhire.models.dtos.request.CompanyFilterRequestDTO;
import com.easytech.eazyhire.models.dtos.request.CompanyStatusUpdateRequestDTO;
import com.easytech.eazyhire.services.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
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

    @PatchMapping("/{id}/status")
    public BaseResponse updateCompanyStatus(
            @PathVariable Long id,
            @Valid @RequestBody CompanyStatusUpdateRequestDTO request
    ) {
        AuthorizedUser admin = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        return new BaseResponse(companyService.updateCompanyStatus(
                id, admin.getId(), request.getStatus(), request.getReason()));
    }
}
