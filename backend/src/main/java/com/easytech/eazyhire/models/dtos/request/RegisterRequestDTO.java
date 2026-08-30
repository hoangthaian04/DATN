package com.easytech.eazyhire.models.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
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
public class RegisterRequestDTO {

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Size(max = 255, message = "Email không quá 255 ký tự")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống")
    @Size(min = 8, max = 72, message = "Mật khẩu phải có ít nhất 8 ký tự")
    @Pattern(
            regexp = "^(?=.*[A-Z])(?=.*\\d).+$",
            message = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa và số"
    )
    private String password;

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(max = 255, message = "Họ và tên không quá 255 ký tự")
    private String fullName;

    @NotBlank(message = "Tên công ty không được để trống")
    @Size(max = 255, message = "Tên công ty không quá 255 ký tự")
    private String companyName;

    @NotBlank(message = "Mã số thuế không được để trống")
    @Size(max = 100, message = "Mã số thuế không quá 100 ký tự")
    private String taxCode;

    @Size(max = 50, message = "Số điện thoại không quá 50 ký tự")
    private String phone;

    @Size(max = 100, message = "Loại hình doanh nghiệp không quá 100 ký tự")
    private String businessType;

    @Size(max = 150, message = "Lĩnh vực hoạt động không quá 150 ký tự")
    private String industry;

    @Size(max = 50, message = "Quy mô doanh nghiệp không quá 50 ký tự")
    private String companySize;

    private String address;
}
