package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.ApplicationListResponseDTO;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationListResponseDTO> getApplicationsForJob(Long companyId, Long jobId, String status, PaginationRequest paginationRequest) {
        // Validate job exists in this company if jobId is provided
        if (jobId != null) {
            boolean jobExists = jobRepository.existsByIdAndCompanyId(jobId, companyId);
            if (!jobExists) {
                throw new CustomException(404, "Không tìm thấy công việc");
            }
        }

        Pageable pageable;
        if (paginationRequest.getOrderBy() != null && !paginationRequest.getOrderBy().isEmpty()) {
            String[] sortParams = paginationRequest.getOrderBy().split(":");
            String sortField = sortParams[0];
            Sort.Direction direction = sortParams.length > 1 && sortParams[1].equalsIgnoreCase("DESC") 
                    ? Sort.Direction.DESC : Sort.Direction.ASC;
            pageable = PageRequest.of(paginationRequest.getPage() - 1, paginationRequest.getLimit(), Sort.by(direction, sortField));
        } else {
            pageable = PageRequest.of(paginationRequest.getPage() - 1, paginationRequest.getLimit(), Sort.by(Sort.Direction.DESC, "appliedAt"));
        }

        return applicationRepository.findApplicationsForListView(jobId, companyId, status, pageable);
    }
}
