package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.JobListResponseDTO;
import EazyTech.EazyHire.models.dtos.JobStatsResponseDTO;
import EazyTech.EazyHire.models.dtos.JobDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.UpdateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.SaveJobPipelineRequestDTO;
import EazyTech.EazyHire.models.dtos.PipelineRoundRequestDTO;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final HiringRoundRepository hiringRoundRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    public Page<JobListResponseDTO> getJobs(Long companyId, String keyword, String status, PaginationRequest paginationRequest) {
        if (keyword == null) {
            keyword = "";
        } else {
            keyword = keyword.trim();
        }

        if (status == null) {
            status = "";
        } else {
            status = status.trim();
        }

        int page = paginationRequest.getPage() > 0 ? paginationRequest.getPage() - 1 : 0;
        int limit = paginationRequest.getLimit() > 0 ? paginationRequest.getLimit() : 10;
        
        Pageable pageable = PageRequest.of(page, limit);

        return jobRepository.findJobsByFilter(companyId, keyword, status, pageable);
    }

    @Override
    public JobStatsResponseDTO getJobStats(Long companyId) {
        JobStatsResponseDTO stats = jobRepository.getJobStatsByCompanyId(companyId);
        if (stats == null) {
            return JobStatsResponseDTO.builder()
                    .total(0L)
                    .active(0L)
                    .inactive(0L)
                    .closed(0L)
                    .build();
        }
        
        // Handle null values returned by SUM query if no jobs exist
        if (stats.getTotal() == null) stats.setTotal(0L);
        if (stats.getActive() == null) stats.setActive(0L);
        if (stats.getInactive() == null) stats.setInactive(0L);
        if (stats.getClosed() == null) stats.setClosed(0L);
        
        return stats;
    }

    @Override
    public JobDetailResponseDTO getJobById(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));

        if (!job.getCompany().getId().equals(companyId)) {
            throw new CustomException(403, "Bạn không có quyền truy cập Job này");
        }

        if (job.getIsDeleted() != null && job.getIsDeleted()) {
            throw new CustomException(404, "Job này đã bị xóa");
        }

        return mapToJobDetailDTO(job);
    }

    @Override
    @Transactional
    public JobDetailResponseDTO updateJob(Long jobId, UpdateJobRequestDTO request, Long companyId) {
        JobEntity job = getEditableJob(jobId, companyId);
        applyJobUpdate(job, request);
        job = jobRepository.save(job);
        
        return mapToJobDetailDTO(job);
    }

    @Override
    @Transactional
    public JobDetailResponseDTO saveJobPipeline(Long jobId, SaveJobPipelineRequestDTO request, Long companyId) {
        JobEntity job = getEditableJob(jobId, companyId);
        List<HiringRoundEntity> existing = hiringRoundRepository
                .findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(jobId, companyId);
        Map<Long, HiringRoundEntity> existingById = new HashMap<>();
        existing.forEach(round -> existingById.put(round.getId(), round));
        Set<Long> submittedIds = new HashSet<>();

        for (PipelineRoundRequestDTO input : request.getRounds()) {
            if (input.getId() != null && (!existingById.containsKey(input.getId()) || !submittedIds.add(input.getId()))) {
                throw new CustomException(400, "Danh sách vòng tuyển dụng không hợp lệ");
            }
        }
        for (HiringRoundEntity round : existing) {
            if (!submittedIds.contains(round.getId())) {
                if (applicationRepository.existsByJobIdAndCurrentRoundId(jobId, round.getId())) {
                    throw new CustomException(400, "Không thể xóa vòng phỏng vấn đang có ứng viên");
                }
                round.setIsDeleted(true);
            }
        }

        // Move existing indexes away first so the unique (job_id, order_index) constraint is never violated.
        int offset = existing.size() + request.getRounds().size() + 1;
        existing.forEach(round -> { if (!Boolean.TRUE.equals(round.getIsDeleted())) round.setOrderIndex(round.getOrderIndex() + offset); });
        hiringRoundRepository.saveAllAndFlush(existing);

        List<HiringRoundEntity> ordered = new ArrayList<>();
        for (int index = 0; index < request.getRounds().size(); index++) {
            PipelineRoundRequestDTO input = request.getRounds().get(index);
            HiringRoundEntity round = input.getId() == null
                    ? HiringRoundEntity.builder().company(job.getCompany()).job(job).isDeleted(false).build()
                    : existingById.get(input.getId());
            round.setName(input.getName().trim());
            round.setDescription(input.getDescription());
            round.setPassEmailTemplateId(input.getPassEmailTemplateId());
            round.setFailEmailTemplateId(input.getFailEmailTemplateId());
            round.setTestLink(input.getTestLink());
            round.setIsFinalRound(Boolean.TRUE.equals(input.getIsFinalRound()));
            round.setOrderIndex(index);
            ordered.add(round);
        }
        hiringRoundRepository.saveAll(ordered);
        applyJobUpdate(job, request.getJob());
        job.setRoundCount(ordered.size());
        return mapToJobDetailDTO(jobRepository.save(job));
    }

    private JobEntity getEditableJob(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId).orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));
        if (!job.getCompany().getId().equals(companyId)) throw new CustomException(403, "Bạn không có quyền chỉnh sửa Job này");
        if (Boolean.TRUE.equals(job.getIsDeleted())) throw new CustomException(400, "Job này đã bị xóa, không thể chỉnh sửa");
        if ("CLOSED".equals(job.getStatus())) throw new CustomException(400, "Job này đã đóng, không thể chỉnh sửa");
        return job;
    }

    private void applyJobUpdate(JobEntity job, UpdateJobRequestDTO request) {
        job.setTitle(request.getTitle()); job.setDescription(request.getDescription()); job.setRequirements(request.getRequirements());
        job.setBenefits(request.getBenefits()); job.setSalaryMin(request.getSalaryMin()); job.setSalaryMax(request.getSalaryMax());
        job.setCurrency(request.getCurrency()); job.setLocation(request.getLocation()); job.setWorkingType(request.getWorkingType());
        job.setEmploymentType(request.getEmploymentType()); job.setExperienceLevel(request.getExperienceLevel()); job.setExperienceYearsMin(request.getExperienceYearsMin());
    }

    private JobDetailResponseDTO mapToJobDetailDTO(JobEntity job) {
        return JobDetailResponseDTO.builder()
                .id(job.getId())
                .title(job.getTitle())
                .slug(job.getSlug())
                .description(job.getDescription())
                .requirements(job.getRequirements())
                .benefits(job.getBenefits())
                .salaryMin(job.getSalaryMin())
                .salaryMax(job.getSalaryMax())
                .currency(job.getCurrency())
                .location(job.getLocation())
                .workingType(job.getWorkingType())
                .employmentType(job.getEmploymentType())
                .experienceLevel(job.getExperienceLevel())
                .experienceYearsMin(job.getExperienceYearsMin())
                .roundCount(job.getRoundCount())
                .status(job.getStatus())
                .publishedAt(job.getPublishedAt())
                .closedAt(job.getClosedAt())
                .createdAt(job.getCreatedAt())
                .updatedAt(job.getUpdatedAt())
                .build();
    }

    @Override
    @Transactional
    public void deleteJob(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));

        if (!job.getCompany().getId().equals(companyId)) {
            throw new CustomException(403, "Bạn không có quyền xóa Job này");
        }

        if (job.getIsDeleted() != null && job.getIsDeleted()) {
            throw new CustomException(400, "Job này đã bị xóa");
        }

        job.setIsDeleted(true);
        jobRepository.save(job);
        
        // Theo yêu cầu xóa mềm (Soft Delete), không xóa các Application con 
        // để bảo toàn dữ liệu lịch sử ứng viên.
    }
}
