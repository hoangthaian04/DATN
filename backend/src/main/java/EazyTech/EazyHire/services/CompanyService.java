package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.CompanyProfileEntity;
import EazyTech.EazyHire.models.dtos.*;
import org.springframework.web.multipart.MultipartFile;
import EazyTech.EazyHire.models.dtos.CompanyDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.CompanyFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.CompanyResponseDTO;
import org.springframework.data.domain.Page;

public interface CompanyService {

    Page<CompanyResponseDTO> getCompanies(CompanyFilterRequestDTO request);

    CompanyDetailResponseDTO getCompanyDetail(Long id);

    CompanyResponseDTO approveCompany(Long companyId, Long adminId);

    CompanyResponseDTO rejectCompany(Long companyId, Long adminId, String reason);

    CompanyResponseDTO blockCompany(Long companyId, Long adminId);

 CompanyResponseDTO changeStatus(Long companyId,Long adminId,CompanyStatusRequestDTO request);
 CompanyEntity createRegistration(RegisterRequestDTO request);
 CompanyDetailResponseDTO getMyCompany(Long userId);
 CompanyDetailResponseDTO updateProfile(Long userId,OnboardingRequestDTO request);
 CompanyDetailResponseDTO uploadLogo(Long userId,MultipartFile file);
 CompanyDetailResponseDTO resubmit(Long userId,RegistrationUpdateRequestDTO request);
 int completedSteps(CompanyEntity company,CompanyProfileEntity profile);
}
