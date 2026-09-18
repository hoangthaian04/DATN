package EazyTech.EazyHire.services;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.models.dtos.JobListResponseDTO;
import EazyTech.EazyHire.models.dtos.JobStatsResponseDTO;
import EazyTech.EazyHire.models.dtos.JobDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.CreateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.UpdateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.SaveJobPipelineRequestDTO;
import org.springframework.data.domain.Page;

public interface JobService {
    Page<JobListResponseDTO> getJobs(Long companyId, String keyword, String status, PaginationRequest paginationRequest);
    JobStatsResponseDTO getJobStats(Long companyId);

    JobDetailResponseDTO createJob(CreateJobRequestDTO request, Long companyId, Long userId);

    JobDetailResponseDTO publishJob(Long jobId, Long companyId, Long userId);
    JobDetailResponseDTO closeJob(Long jobId, Long companyId, Long userId);
    JobDetailResponseDTO reopenJob(Long jobId, Long companyId, Long userId);

    JobDetailResponseDTO getJobById(Long jobId, Long companyId);

    JobDetailResponseDTO updateJob(Long jobId, UpdateJobRequestDTO request, Long companyId, Long userId);
    JobDetailResponseDTO saveJobPipeline(Long jobId, SaveJobPipelineRequestDTO request, Long companyId, Long userId);

    void deleteJob(Long jobId, Long companyId);
}
