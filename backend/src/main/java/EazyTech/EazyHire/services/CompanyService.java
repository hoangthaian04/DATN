package EazyTech.EazyHire.services;

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
}
