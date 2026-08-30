package com.easytech.eazyhire.models.dtos.response;

import com.easytech.eazyhire.models.enums.CompanyStatus;
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
public class CompanyResponseDTO {
    private Long id;
    private String name;
    private String slug;
    private String subdomain;
    private String taxCode;
    private String phone;
    private String email;
    private String website;
    private String address;
    private CompanyStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectedReason;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
