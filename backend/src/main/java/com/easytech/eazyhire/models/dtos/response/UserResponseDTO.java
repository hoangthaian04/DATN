package com.easytech.eazyhire.models.dtos.response;

import com.easytech.eazyhire.models.enums.CompanyStatus;
import com.easytech.eazyhire.models.enums.UserRole;
import com.easytech.eazyhire.models.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private UserRole role;
    private UserStatus status;
    private Long companyId;
    private String companyName;
    private String companySlug;
    private CompanyStatus companyStatus;
    private Boolean onboardingCompleted;
    private Boolean profileCompleted;
    private LocalDateTime createdAt;
}
