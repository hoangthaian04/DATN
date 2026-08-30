package com.easytech.eazyhire.models.dtos.request;

import com.easytech.eazyhire.models.enums.CompanyStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyStatusUpdateRequestDTO {
    @NotNull(message = "Trạng thái doanh nghiệp không được để trống")
    private CompanyStatus status;

    @Size(min = 10, max = 1000, message = "Lý do phải từ 10 đến 1000 ký tự")
    private String reason;
}
