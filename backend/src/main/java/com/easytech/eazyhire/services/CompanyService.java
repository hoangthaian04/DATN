package com.easytech.eazyhire.services;

import com.easytech.eazyhire.models.dtos.response.CompanyDetailResponseDTO;
import com.easytech.eazyhire.models.dtos.request.CompanyFilterRequestDTO;
import com.easytech.eazyhire.models.dtos.response.CompanyResponseDTO;
import com.easytech.eazyhire.models.dtos.response.CompanyProfileDTO;
import com.easytech.eazyhire.models.dtos.request.OnboardingRequestDTO;
import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.models.entities.CompanyEntity;
import com.easytech.eazyhire.models.entities.CompanyProfileEntity;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import org.springframework.data.domain.Page;

public interface CompanyService {

    Page<CompanyResponseDTO> getCompanies(CompanyFilterRequestDTO request);

    CompanyDetailResponseDTO getCompanyDetail(Long id);

    CompanyEntity createPendingCompany(RegisterRequestDTO request);

    CompanyProfileEntity createInitialProfile(CompanyEntity company, RegisterRequestDTO request);

    CompanyProfileEntity getProfile(Long companyId);

    CompanyProfileDTO getProfileResponse(Long companyId);

    CompanyDetailResponseDTO updateProfile(Long companyId, OnboardingRequestDTO request);

    CompanyDetailResponseDTO completeOnboarding(Long companyId, boolean skip);

    CompanyResponseDTO updateCompanyStatus(Long companyId, Long adminId, CompanyStatus status, String reason);
}
