package EazyTech.EazyHire.services;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO;
import org.springframework.data.domain.Page;

import EazyTech.EazyHire.models.dtos.ApplicationDetailResponseDTO;

public interface ApplicationService {
    Page<ApplicationListResponseDTO> getApplicationsForJob(Long companyId, Long jobId, String status, PaginationRequest paginationRequest);
    ApplicationListResponseDTO updateApplicationRound(Long companyId, Long applicationId, Long targetRoundId, String status);
    ApplicationDetailResponseDTO getApplicationDetail(Long companyId, Long applicationId);
}
