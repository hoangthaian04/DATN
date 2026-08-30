package com.easytech.eazyhire.models.dtos.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyRegistrationUpdateRequestDTO {

    @Size(max = 255, message = "Họ và tên không quá 255 ký tự")
    private String fullName;

    @Size(max = 255, message = "Tên công ty không quá 255 ký tự")
    private String companyName;

    @Size(max = 100, message = "Mã số thuế không quá 100 ký tự")
    private String taxCode;
}
