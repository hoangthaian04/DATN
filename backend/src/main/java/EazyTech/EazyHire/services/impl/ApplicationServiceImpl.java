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

import java.util.Locale;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ApplicationServiceImpl implements ApplicationService {

    private static final Set<String> APPLICATION_STATUSES = Set.of("ACTIVE", "REJECTED", "HIRED");

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationListResponseDTO> getApplicationsForJob(
            Long companyId,
            Long jobId,
            String status,
            String keyword,
            PaginationRequest paginationRequest
    ) {
        // Validate job exists in this company if jobId is provided
        if (jobId != null) {
            boolean jobExists = jobRepository.existsByIdAndCompanyId(jobId, companyId);
            if (!jobExists) {
                throw new CustomException(404, "Không tìm thấy công việc");
            }
        }

        if (status != null) {
            status = status.trim().toUpperCase(Locale.ROOT);
            if (!status.isEmpty() && !APPLICATION_STATUSES.contains(status)) {
                throw new CustomException(400,
                        "Trạng thái hồ sơ không hợp lệ. Chỉ hỗ trợ ACTIVE, REJECTED hoặc HIRED");
            }
        }

        if (keyword != null) {
            keyword = keyword.trim();
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

        return applicationRepository.findApplicationsForListView(jobId, companyId, status, keyword, pageable);
    }
}
