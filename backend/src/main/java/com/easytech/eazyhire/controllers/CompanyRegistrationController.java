package com.easytech.eazyhire.controllers;

import com.easytech.eazyhire.core.AuthorizedUser;
import com.easytech.eazyhire.core.BaseResponse;
import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.core.utils.SecurityUtils;
import com.easytech.eazyhire.models.dtos.request.CompanyRegistrationUpdateRequestDTO;
import com.easytech.eazyhire.services.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/company-registration/me")
@PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
@RequiredArgsConstructor
public class CompanyRegistrationController {

    private final CompanyService companyService;

    @GetMapping
    public BaseResponse getOwnRegistration() {
        return BaseResponse.success(
                "Lấy hồ sơ đăng ký doanh nghiệp thành công",
                companyService.getOwnRegistration(currentUser().getId()));
    }

    @PatchMapping
    public BaseResponse updateOwnRegistration(
            @Valid @RequestBody CompanyRegistrationUpdateRequestDTO request
    ) {
        return BaseResponse.success(
                "Cập nhật hồ sơ đăng ký doanh nghiệp thành công",
                companyService.updateOwnRegistration(currentUser().getId(), request));
    }

    @PostMapping("/resubmit")
    public BaseResponse resubmitOwnRegistration() {
        return BaseResponse.success(
                "Gửi lại hồ sơ đăng ký doanh nghiệp thành công",
                companyService.resubmitOwnRegistration(currentUser().getId()));
    }

    private AuthorizedUser currentUser() {
        return SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
    }
}
