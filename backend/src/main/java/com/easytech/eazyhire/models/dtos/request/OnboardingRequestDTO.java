package com.easytech.eazyhire.models.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingRequestDTO {

    @Size(max = 255, message = "Tên công ty không quá 255 ký tự")
    private String companyName;

    @Size(max = 100, message = "Mã số thuế không quá 100 ký tự")
    private String taxCode;

    @Size(max = 50, message = "Số điện thoại không quá 50 ký tự")
    private String phone;

    @Email(message = "Email công ty không đúng định dạng")
    @Size(max = 255, message = "Email công ty không quá 255 ký tự")
    private String email;

    @Size(max = 255, message = "Website không quá 255 ký tự")
    private String website;

    private String address;

    private String logoUrl;

    private String bannerUrl;

    @Size(max = 20, message = "Mã màu không hợp lệ")
    private String primaryColor;

    private String description;

    private String benefits;

    @Size(max = 100, message = "Loại hình doanh nghiệp không quá 100 ký tự")
    private String businessType;

    @Size(max = 150, message = "Lĩnh vực hoạt động không quá 150 ký tự")
    private String industry;

    @Size(max = 50, message = "Quy mô doanh nghiệp không quá 50 ký tự")
    private String companySize;
}
