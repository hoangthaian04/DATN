package com.easytech.eazyhire.controllers;

import com.easytech.eazyhire.core.AuthorizedUser;
import com.easytech.eazyhire.core.BaseResponse;
import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.core.utils.SecurityUtils;
import com.easytech.eazyhire.models.dtos.request.OnboardingCompletionRequestDTO;
import com.easytech.eazyhire.models.dtos.request.OnboardingRequestDTO;
import com.easytech.eazyhire.services.CompanyService;
import com.easytech.eazyhire.services.LogoStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/company-profiles/me")
@PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
@RequiredArgsConstructor
public class CompanyProfilesController {
    private final CompanyService companyService;
    private final LogoStorageService logoStorageService;

    @GetMapping
    public BaseResponse getProfile() {
        return new BaseResponse(companyService.getProfileResponse(currentCompanyId()));
    }

    @PatchMapping
    public BaseResponse updateProfile(@Valid @RequestBody OnboardingRequestDTO request) {
        return new BaseResponse(companyService.updateProfile(currentCompanyId(), request));
    }

    @PatchMapping("/onboarding")
    public BaseResponse completeOnboarding(@RequestBody OnboardingCompletionRequestDTO request) {
        return new BaseResponse(companyService.completeOnboarding(currentCompanyId(), request.isSkip()));
    }

    @PostMapping(path = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public BaseResponse uploadLogo(@RequestPart("file") MultipartFile file) {
        Long companyId = currentCompanyId();
        String logoUrl = logoStorageService.store(companyId, file);
        OnboardingRequestDTO request = OnboardingRequestDTO.builder().logoUrl(logoUrl).build();
        return new BaseResponse(companyService.updateProfile(companyId, request));
    }

    private Long currentCompanyId() {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        if (user.getCompanyId() == null) throw new CustomException(403, "Tài khoản không thuộc doanh nghiệp");
        return user.getCompanyId();
    }
}
