package EazyTech.EazyHire.services;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO;
import org.springframework.data.domain.Page;

public interface ApplicationService {
    Page<ApplicationListResponseDTO> getApplicationsForJob(Long companyId, Long jobId, String status, PaginationRequest paginationRequest);
}
