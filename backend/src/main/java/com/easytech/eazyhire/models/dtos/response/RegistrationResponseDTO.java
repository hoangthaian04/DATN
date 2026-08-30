package com.easytech.eazyhire.models.dtos.response;

import com.easytech.eazyhire.models.enums.CompanyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegistrationResponseDTO {
    private String email;
    private String companyName;
    private CompanyStatus companyStatus;
}
