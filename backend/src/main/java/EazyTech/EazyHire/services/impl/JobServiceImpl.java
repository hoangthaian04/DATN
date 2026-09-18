package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.StringUtils;
import EazyTech.EazyHire.models.dtos.CreateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.JobListResponseDTO;
import EazyTech.EazyHire.models.dtos.JobStatsResponseDTO;
import EazyTech.EazyHire.models.dtos.JobDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.UpdateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.SaveJobPipelineRequestDTO;
import EazyTech.EazyHire.models.dtos.PipelineRoundRequestDTO;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.JobCategoryRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;

@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuditService auditService;
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
    @Transactional
    public JobDetailResponseDTO createJob(CreateJobRequestDTO request, Long companyId, Long userId) {
        if (companyId == null || userId == null) {
            throw new CustomException(403, "Tài khoản chưa thuộc workspace tuyển dụng hợp lệ");
        }
        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy doanh nghiệp"));
        UserEntity creator = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(401, "Phiên làm việc không hợp lệ"));
        if (creator.getCompany() == null || !companyId.equals(creator.getCompany().getId())) {
            throw new CustomException(403, "Bạn không có quyền tạo Job cho doanh nghiệp này");
        }
        if (company.getStatus() != CompanyStatus.ACTIVE) {
            throw new CustomException(403, "Doanh nghiệp chưa ở trạng thái ACTIVE để tạo Job");
        }
        if (creator.getStatus() != UserStatus.ACTIVE) {
            throw new CustomException(403, "Tài khoản chưa ở trạng thái ACTIVE để tạo Job");
        }

        JobCategoryEntity category = jobCategoryRepository
                .findByIdAndStatusAndIsDeletedFalse(request.getCategoryId(), JobCategoryStatus.ACTIVE)
                .orElseThrow(() -> new CustomException(
                        400,
                        "Chỉ được chọn danh mục đang ACTIVE và chưa bị xóa."
                ));
        validateJobOptions(request);

        JobEntity job = JobEntity.builder()
                .company(company)
                .createdBy(creator)
                .category(category)
                .title(request.getTitle().trim())
                .slug(uniqueJobSlug(companyId, request.getTitle().trim()))
                .description(request.getDescription())
                .requirements(request.getRequirements())
                .benefits(request.getBenefits())
                .salaryMin(request.getSalaryMin())
                .salaryMax(request.getSalaryMax())
                .currency(normalizeOrDefault(request.getCurrency(), "VND"))
                .location(request.getLocation().trim())
                .workingType(request.getWorkingType().trim().toUpperCase(Locale.ROOT))
                .employmentType(request.getEmploymentType().trim().toUpperCase(Locale.ROOT))
                .experienceLevel(normalizeOrDefault(request.getExperienceLevel(), "MID"))
                .experienceYearsMin(request.getExperienceYearsMin())
                .roundCount(0)
                .status("INACTIVE")
                .isDeleted(false)
                .build();

        return mapToJobDetailDTO(jobRepository.save(job));
    }

    @Override
    @Transactional
    public JobDetailResponseDTO publishJob(Long jobId, Long companyId, Long userId) {
        JobEntity job = getTransitionableJob(jobId, companyId);
        ensureActiveWorkspace(companyId, userId);
        if (!"INACTIVE".equals(job.getStatus())) {
            throw new CustomException(409, "Chỉ có thể publish Job đang ở trạng thái INACTIVE");
        }
        validatePublishable(job);
        job.setStatus("ACTIVE");
        job.setPublishedAt(java.time.LocalDateTime.now());
        job.setClosedAt(null);
        JobEntity saved = jobRepository.save(job);
        auditService.recordTarget(userId, companyId, "JOB", saved.getId(), "PUBLISH_JOB", "Publish Job: " + saved.getTitle());
        return mapToJobDetailDTO(saved);
    }

    @Override
    @Transactional
    public JobDetailResponseDTO closeJob(Long jobId, Long companyId, Long userId) {
        JobEntity job = getTransitionableJob(jobId, companyId);
        ensureActiveWorkspace(companyId, userId);
        if (!"ACTIVE".equals(job.getStatus())) {
            throw new CustomException(409, "Chỉ có thể đóng Job đang ở trạng thái ACTIVE");
        }
        job.setStatus("CLOSED");
        job.setClosedAt(java.time.LocalDateTime.now());
        JobEntity saved = jobRepository.save(job);
        auditService.recordTarget(userId, companyId, "JOB", saved.getId(), "CLOSE_JOB", "Đóng Job: " + saved.getTitle());
        return mapToJobDetailDTO(saved);
    }

    @Override
    @Transactional
    public JobDetailResponseDTO reopenJob(Long jobId, Long companyId, Long userId) {
        JobEntity job = getTransitionableJob(jobId, companyId);
        ensureActiveWorkspace(companyId, userId);
        if (!"CLOSED".equals(job.getStatus())) {
            throw new CustomException(409, "Chỉ có thể mở lại Job đang ở trạng thái CLOSED");
        }
        validatePublishable(job);
        job.setStatus("ACTIVE");
        job.setPublishedAt(java.time.LocalDateTime.now());
        job.setClosedAt(null);
        JobEntity saved = jobRepository.save(job);
        auditService.recordTarget(userId, companyId, "JOB", saved.getId(), "REOPEN_JOB", "Mở lại Job: " + saved.getTitle());
        return mapToJobDetailDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public JobDetailResponseDTO getJobById(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));

        if (!job.getCompany().getId().equals(companyId)) {
            throw new CustomException(404, "Không tìm thấy Job trong workspace hiện tại");
        }

        if (job.getIsDeleted() != null && job.getIsDeleted()) {
            throw new CustomException(404, "Job này đã bị xóa");
        }

        return mapToJobDetailDTO(job);
    }

    @Override
    @Transactional
    public JobDetailResponseDTO updateJob(Long jobId, UpdateJobRequestDTO request, Long companyId, Long userId) {
        JobEntity job = getEditableJob(jobId, companyId);
        ensureActiveWorkspace(companyId, userId);
        if (request.getRoundCount() != null) {
            long configuredRoundCount = hiringRoundRepository
                    .countByJobIdAndCompanyIdAndIsDeletedFalse(jobId, companyId);
            if (request.getRoundCount().longValue() != configuredRoundCount) {
                throw new CustomException(
                        400,
                        "roundCount phải khớp với số vòng tuyển dụng đang cấu hình của Job"
                );
            }
        }
        applyJobUpdate(job, request);
        if (request.getRoundCount() != null) {
            job.setRoundCount(request.getRoundCount());
        }
        job = jobRepository.save(job);
        auditService.recordTarget(userId, companyId, "JOB", job.getId(), "UPDATE_JOB", "Cập nhật Job: " + job.getTitle());
        return mapToJobDetailDTO(job);
    }

    @Override
    @Transactional
    public JobDetailResponseDTO saveJobPipeline(Long jobId, SaveJobPipelineRequestDTO request, Long companyId, Long userId) {
        ensureActiveWorkspace(companyId, userId);
        JobEntity job = getEditableJob(jobId, companyId);
        if (request.getJob().getRoundCount() != null
                && request.getJob().getRoundCount() != request.getRounds().size()) {
            throw new CustomException(
                    400,
                    "roundCount phải khớp với số vòng tuyển dụng đang gửi trong pipeline"
            );
        }
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
        JobEntity saved = jobRepository.save(job);
        auditService.recordTarget(userId, companyId, "JOB", saved.getId(), "SAVE_JOB_PIPELINE", "Cập nhật thông tin Job và pipeline");
        return mapToJobDetailDTO(saved);
    }

    private JobEntity getEditableJob(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId).orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));
        if (!job.getCompany().getId().equals(companyId)) throw new CustomException(404, "Không tìm thấy Job trong workspace hiện tại");
        if (Boolean.TRUE.equals(job.getIsDeleted())) throw new CustomException(404, "Job này đã bị xóa");
        if ("CLOSED".equals(job.getStatus())) throw new CustomException(409, "Job này đã đóng, không thể chỉnh sửa");
        return job;
    }

    private JobEntity getTransitionableJob(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));
        if (!job.getCompany().getId().equals(companyId)) {
            throw new CustomException(404, "Không tìm thấy Job trong workspace hiện tại");
        }
        if (Boolean.TRUE.equals(job.getIsDeleted())) {
            throw new CustomException(404, "Job này đã bị xóa");
        }
        return job;
    }

    private void ensureActiveWorkspace(Long companyId, Long userId) {
        if (companyId == null || userId == null) {
            throw new CustomException(403, "Tài khoản chưa thuộc workspace tuyển dụng hợp lệ");
        }

        CompanyEntity company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CustomException(403, "Workspace tuyển dụng không khả dụng"));
        UserEntity user = userRepository.findByIdWithCompany(userId)
                .orElseThrow(() -> new CustomException(401, "Phiên làm việc không hợp lệ"));

        if (user.getCompany() == null || !companyId.equals(user.getCompany().getId())) {
            throw new CustomException(403, "Bạn không có quyền thao tác trong workspace này");
        }
        if (company.getStatus() != CompanyStatus.ACTIVE || user.getStatus() != UserStatus.ACTIVE) {
            throw new CustomException(403, "Workspace hoặc tài khoản chưa ở trạng thái ACTIVE");
        }
    }

    private void validatePublishable(JobEntity job) {
        if (job.getTitle() == null || job.getTitle().isBlank()) {
            throw new CustomException(400, "Job cần có tiêu đề trước khi publish");
        }
        if (job.getDescription() == null || job.getDescription().isBlank()) {
            throw new CustomException(400, "Job cần có mô tả công việc trước khi publish");
        }
        if (job.getLocation() == null || job.getLocation().isBlank()) {
            throw new CustomException(400, "Job cần có địa điểm trước khi publish");
        }
        if (job.getSalaryMin() == null || job.getSalaryMax() == null
                || job.getSalaryMin().signum() < 0
                || job.getSalaryMax().signum() < 0
                || job.getSalaryMax().compareTo(job.getSalaryMin()) < 0) {
            throw new CustomException(400, "Job cần có khoảng lương hợp lệ trước khi publish");
        }
        if (job.getCategory() == null || Boolean.TRUE.equals(job.getCategory().getIsDeleted())) {
            throw new CustomException(400, "Job cần liên kết với danh mục chưa bị xóa trước khi publish");
        }
        // Category INACTIVE is allowed here for an existing Job. US-07 prohibits
        // selecting it for new/change requests but preserves old Job associations.
    }

    private void applyJobUpdate(JobEntity job, UpdateJobRequestDTO request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new CustomException(400, "Tiêu đề không được để trống");
        }
        validateJobUpdateOptions(job, request);

        JobCategoryEntity replacementCategory = null;
        if (request.getCategoryId() != null) {
            replacementCategory = jobCategoryRepository
                    .findByIdAndStatusAndIsDeletedFalse(request.getCategoryId(), JobCategoryStatus.ACTIVE)
                    .orElseThrow(() -> new CustomException(
                            400,
                            "Chỉ được chọn danh mục đang ACTIVE và chưa bị xóa."
                    ));
            job.setCategory(replacementCategory);
        }
        job.setTitle(request.getTitle().trim());
        if (request.getDescription() != null) job.setDescription(request.getDescription());
        if (request.getRequirements() != null) job.setRequirements(request.getRequirements());
        if (request.getBenefits() != null) job.setBenefits(request.getBenefits());
        if (request.getSalaryMin() != null) job.setSalaryMin(request.getSalaryMin());
        if (request.getSalaryMax() != null) job.setSalaryMax(request.getSalaryMax());
        if (request.getCurrency() != null) job.setCurrency(normalizeOrDefault(request.getCurrency(), "VND"));
        if (request.getLocation() != null) job.setLocation(request.getLocation().trim());
        if (request.getWorkingType() != null) job.setWorkingType(request.getWorkingType().trim().toUpperCase(Locale.ROOT));
        if (request.getEmploymentType() != null) job.setEmploymentType(request.getEmploymentType().trim().toUpperCase(Locale.ROOT));
        if (request.getExperienceLevel() != null) {
            job.setExperienceLevel(normalizeOrDefault(request.getExperienceLevel(), "MID"));
        }
        if (request.getExperienceYearsMin() != null) job.setExperienceYearsMin(request.getExperienceYearsMin());
    }

    private void validateJobUpdateOptions(JobEntity job, UpdateJobRequestDTO request) {
        BigDecimal salaryMin = request.getSalaryMin() != null ? request.getSalaryMin() : job.getSalaryMin();
        BigDecimal salaryMax = request.getSalaryMax() != null ? request.getSalaryMax() : job.getSalaryMax();
        if (salaryMin != null && salaryMax != null && salaryMax.compareTo(salaryMin) < 0) {
            throw new CustomException(400, "Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu");
        }

        String currency = request.getCurrency() != null
                ? normalizeOrDefault(request.getCurrency(), "VND")
                : normalizeOrDefault(job.getCurrency(), "VND");
        validateAllowed("currency", currency, Set.of("VND", "USD"));

        String workingType = request.getWorkingType() != null
                ? request.getWorkingType().trim().toUpperCase(Locale.ROOT)
                : job.getWorkingType();
        if (workingType != null && !workingType.isBlank()) {
            validateAllowed("workingType", workingType, Set.of("ONSITE", "REMOTE", "HYBRID"));
        }

        String employmentType = request.getEmploymentType() != null
                ? request.getEmploymentType().trim().toUpperCase(Locale.ROOT)
                : job.getEmploymentType();
        if (employmentType != null && !employmentType.isBlank()) {
            validateAllowed("employmentType", employmentType, Set.of("FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"));
        }

        String experienceLevel = request.getExperienceLevel() != null
                ? request.getExperienceLevel().trim().toUpperCase(Locale.ROOT)
                : job.getExperienceLevel();
        if (experienceLevel != null && !experienceLevel.isBlank()) {
            validateAllowed("experienceLevel", experienceLevel, Set.of("INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"));
        }
    }

    private void validateJobOptions(CreateJobRequestDTO request) {
        if (request.getSalaryMax().compareTo(request.getSalaryMin()) < 0) {
            throw new CustomException(400, "Mức lương tối đa phải lớn hơn hoặc bằng mức lương tối thiểu");
        }
        validateAllowed("currency", normalizeOrDefault(request.getCurrency(), "VND"), Set.of("VND", "USD"));
        validateAllowed("workingType", request.getWorkingType().trim().toUpperCase(Locale.ROOT), Set.of("ONSITE", "REMOTE", "HYBRID"));
        validateAllowed("employmentType", request.getEmploymentType().trim().toUpperCase(Locale.ROOT), Set.of("FULL_TIME", "PART_TIME", "CONTRACT", "INTERNSHIP"));
        if (request.getExperienceLevel() != null && !request.getExperienceLevel().isBlank()) {
            validateAllowed("experienceLevel", request.getExperienceLevel().trim().toUpperCase(Locale.ROOT), Set.of("INTERN", "JUNIOR", "MID", "SENIOR", "LEAD"));
        }
    }

    private void validateAllowed(String field, String value, Set<String> allowed) {
        if (!allowed.contains(value)) {
            throw new CustomException(400, field + " không hợp lệ");
        }
    }

    private String normalizeOrDefault(String value, String defaultValue) {
        return value == null || value.isBlank() ? defaultValue : value.trim().toUpperCase(Locale.ROOT);
    }

    private String uniqueJobSlug(Long companyId, String title) {
        String base = StringUtils.toSlug(title);
        if (base.isBlank()) {
            throw new CustomException(400, "Không thể tạo slug từ tiêu đề Job");
        }
        String candidate = base;
        int suffix = 2;
        while (jobRepository.existsByCompanyIdAndSlug(companyId, candidate)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private JobDetailResponseDTO mapToJobDetailDTO(JobEntity job) {
        return JobDetailResponseDTO.builder()
                .id(job.getId())
                .categoryId(job.getCategory() != null ? job.getCategory().getId() : null)
                .categoryName(job.getCategory() != null ? job.getCategory().getName() : null)
                .categorySlug(job.getCategory() != null ? job.getCategory().getSlug() : null)
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
