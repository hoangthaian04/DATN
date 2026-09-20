package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.CreateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.PipelineRoundRequestDTO;
import EazyTech.EazyHire.models.dtos.SaveJobPipelineRequestDTO;
import EazyTech.EazyHire.models.dtos.UpdateJobRequestDTO;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
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
import EazyTech.EazyHire.services.impl.JobServiceImpl;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.EmailTemplateService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobServiceImplTest {

    @Mock
    private JobRepository jobRepository;

    @Mock
    private JobCategoryRepository jobCategoryRepository;

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @Mock
    private HiringRoundRepository hiringRoundRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private EmailTemplateService emailTemplateService;

    @InjectMocks
    private JobServiceImpl service;

    @Test
    void createJobUsesActiveCategoryAndStartsInactive() {
        CompanyEntity company = CompanyEntity.builder()
                .id(20L)
                .status(CompanyStatus.ACTIVE)
                .build();
        UserEntity creator = UserEntity.builder()
                .id(30L)
                .company(company)
                .email("hr@example.com")
                .fullName("HR")
                .build();
        JobCategoryEntity category = category(1L, JobCategoryStatus.ACTIVE);
        when(companyRepository.findById(20L)).thenReturn(Optional.of(company));
        when(userRepository.findByIdWithCompany(30L)).thenReturn(Optional.of(creator));
        when(jobCategoryRepository.findByIdAndStatusAndIsDeletedFalse(1L, JobCategoryStatus.ACTIVE))
                .thenReturn(Optional.of(category));
        when(jobRepository.existsByCompanyIdAndSlug(20L, "senior-engineer")).thenReturn(false);
        when(jobRepository.save(any(JobEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.createJob(createRequest(), 20L, 30L);

        assertEquals("INACTIVE", result.getStatus());
        assertEquals(1L, result.getCategoryId());
        verify(jobRepository).save(any(JobEntity.class));
    }

    @Test
    void createJobRejectsInactiveCategory() {
        CompanyEntity company = CompanyEntity.builder()
                .id(20L)
                .status(CompanyStatus.ACTIVE)
                .build();
        UserEntity creator = UserEntity.builder()
                .id(30L)
                .company(company)
                .email("hr@example.com")
                .fullName("HR")
                .build();
        when(companyRepository.findById(20L)).thenReturn(Optional.of(company));
        when(userRepository.findByIdWithCompany(30L)).thenReturn(Optional.of(creator));
        when(jobCategoryRepository.findByIdAndStatusAndIsDeletedFalse(1L, JobCategoryStatus.ACTIVE))
                .thenReturn(Optional.empty());

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.createJob(createRequest(), 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void createJobRejectsCompanyThatIsNotActive() {
        CompanyEntity company = CompanyEntity.builder()
                .id(20L)
                .status(CompanyStatus.PENDING)
                .build();
        UserEntity creator = UserEntity.builder()
                .id(30L)
                .company(company)
                .email("hr@example.com")
                .fullName("HR")
                .status(UserStatus.ACTIVE)
                .build();
        when(companyRepository.findById(20L)).thenReturn(Optional.of(company));
        when(userRepository.findByIdWithCompany(30L)).thenReturn(Optional.of(creator));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.createJob(createRequest(), 20L, 30L)
        );

        assertEquals(403, exception.getStatusCode());
        verify(jobCategoryRepository, never()).findByIdAndStatusAndIsDeletedFalse(any(), any());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void createJobRejectsCreatorThatIsNotActive() {
        CompanyEntity company = CompanyEntity.builder()
                .id(20L)
                .status(CompanyStatus.ACTIVE)
                .build();
        UserEntity creator = UserEntity.builder()
                .id(30L)
                .company(company)
                .email("hr@example.com")
                .fullName("HR")
                .status(UserStatus.INACTIVE)
                .build();
        when(companyRepository.findById(20L)).thenReturn(Optional.of(company));
        when(userRepository.findByIdWithCompany(30L)).thenReturn(Optional.of(creator));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.createJob(createRequest(), 20L, 30L)
        );

        assertEquals(403, exception.getStatusCode());
        verify(jobCategoryRepository, never()).findByIdAndStatusAndIsDeletedFalse(any(), any());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void createJobRejectsSalaryRangeWhenMaximumIsLowerThanMinimum() {
        CompanyEntity company = CompanyEntity.builder().id(20L).status(CompanyStatus.ACTIVE).build();
        UserEntity creator = UserEntity.builder()
                .id(30L)
                .company(company)
                .email("hr@example.com")
                .fullName("HR")
                .status(UserStatus.ACTIVE)
                .build();
        JobCategoryEntity category = category(1L, JobCategoryStatus.ACTIVE);
        when(companyRepository.findById(20L)).thenReturn(Optional.of(company));
        when(userRepository.findByIdWithCompany(30L)).thenReturn(Optional.of(creator));
        when(jobCategoryRepository.findByIdAndStatusAndIsDeletedFalse(1L, JobCategoryStatus.ACTIVE))
                .thenReturn(Optional.of(category));

        CreateJobRequestDTO request = createRequest();
        request.setSalaryMin(java.math.BigDecimal.valueOf(2000));
        request.setSalaryMax(java.math.BigDecimal.valueOf(1000));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.createJob(request, 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void updateRejectsInactiveOrDeletedCategory() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobCategoryRepository.findByIdAndStatusAndIsDeletedFalse(2L, JobCategoryStatus.ACTIVE))
                .thenReturn(Optional.empty());

        UpdateJobRequestDTO request = UpdateJobRequestDTO.builder()
                .categoryId(2L)
                .title("Updated title")
                .build();

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.updateJob(10L, request, 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void updatePreservesExistingInactiveCategoryWhenCategoryIsOmitted() {
        JobCategoryEntity inactive = category(1L, JobCategoryStatus.INACTIVE);
        JobEntity job = job(10L, 20L, inactive);
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        UpdateJobRequestDTO request = UpdateJobRequestDTO.builder()
                .title("Updated title")
                .build();

        var result = service.updateJob(10L, request, 20L, 30L);

        assertSame(inactive, job.getCategory());
        assertEquals(1L, result.getCategoryId());
        assertEquals("INACTIVE", inactive.getStatus().name());
        verify(jobCategoryRepository, never())
                .findByIdAndStatusAndIsDeletedFalse(any(), any());
    }

    @Test
    void getJobReturnsCategoryDetailsForTheCurrentCompany() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        var result = service.getJobById(10L, 20L);

        assertEquals(10L, result.getId());
        assertEquals(1L, result.getCategoryId());
        assertEquals("Category 1", result.getCategoryName());
        assertEquals("category-1", result.getCategorySlug());
    }

    @Test
    void getJobHidesAnotherCompanyJob() {
        JobEntity job = job(10L, 99L, category(1L, JobCategoryStatus.ACTIVE));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.getJobById(10L, 20L)
        );

        assertEquals(404, exception.getStatusCode());
    }

    @Test
    void updateHidesAnotherCompanyJobAndDoesNotSave() {
        JobEntity job = job(10L, 99L, category(1L, JobCategoryStatus.ACTIVE));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.updateJob(10L, UpdateJobRequestDTO.builder()
                        .title("Updated title")
                        .build(), 20L, 30L)
        );

        assertEquals(404, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void updateChangesCategoryOnlyWhenItIsActiveAndNotDeleted() {
        JobCategoryEntity current = category(1L, JobCategoryStatus.ACTIVE);
        JobCategoryEntity replacement = category(2L, JobCategoryStatus.ACTIVE);
        JobEntity job = job(10L, 20L, current);
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobCategoryRepository.findByIdAndStatusAndIsDeletedFalse(2L, JobCategoryStatus.ACTIVE))
                .thenReturn(Optional.of(replacement));
        when(jobRepository.save(job)).thenReturn(job);

        UpdateJobRequestDTO request = UpdateJobRequestDTO.builder()
                .categoryId(2L)
                .title("Updated title")
                .build();

        var result = service.updateJob(10L, request, 20L, 30L);

        assertSame(replacement, job.getCategory());
        assertEquals(2L, result.getCategoryId());
        verify(jobRepository).save(job);
    }

    @Test
    void updatePreservesOptionalFieldsThatAreOmitted() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        stubActiveWorkspace(20L, 30L);
        job.setDescription("Existing description");
        job.setRequirements("Existing requirements");
        job.setSalaryMin(java.math.BigDecimal.valueOf(1000));
        job.setSalaryMax(java.math.BigDecimal.valueOf(2000));
        job.setCurrency("USD");
        job.setLocation("Hà Nội");
        job.setWorkingType("HYBRID");
        job.setEmploymentType("FULL_TIME");
        job.setExperienceLevel("SENIOR");
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        var result = service.updateJob(10L, UpdateJobRequestDTO.builder()
                .title(" Updated title ")
                .build(), 20L, 30L);

        assertEquals("Updated title", job.getTitle());
        assertEquals("Existing description", job.getDescription());
        assertEquals(java.math.BigDecimal.valueOf(1000), job.getSalaryMin());
        assertEquals(java.math.BigDecimal.valueOf(2000), job.getSalaryMax());
        assertEquals("USD", job.getCurrency());
        assertEquals("HYBRID", job.getWorkingType());
        assertEquals("Updated title", result.getTitle());
        verify(jobRepository).save(job);
        verify(auditService).recordTarget(30L, 20L, "JOB", 10L, "UPDATE_JOB", "Cập nhật Job: Updated title");
    }

    @Test
    void updateRejectsInvalidSalaryRangeBeforeSaving() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        stubActiveWorkspace(20L, 30L);
        job.setSalaryMin(java.math.BigDecimal.valueOf(1000));
        job.setSalaryMax(java.math.BigDecimal.valueOf(2000));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.updateJob(10L, UpdateJobRequestDTO.builder()
                        .title("Updated title")
                        .salaryMin(java.math.BigDecimal.valueOf(3000))
                        .salaryMax(java.math.BigDecimal.valueOf(2000))
                        .build(), 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void updateRejectsClosedJobWithConflict() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        job.setStatus("CLOSED");
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.updateJob(10L, UpdateJobRequestDTO.builder()
                        .title("Updated title")
                        .build(), 20L, 30L)
        );

        assertEquals(409, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void updateAllowsZeroRoundCountWhenJobHasNoConfiguredRounds() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.countByJobIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(0L);
        when(jobRepository.save(job)).thenReturn(job);

        UpdateJobRequestDTO request = UpdateJobRequestDTO.builder()
                .title("No Interview Job")
                .roundCount(0)
                .build();

        var result = service.updateJob(10L, request, 20L, 30L);

        assertEquals(0, job.getRoundCount());
        assertEquals(0, result.getRoundCount());
        verify(jobRepository).save(job);
    }

    @Test
    void updateRejectsRoundCountThatDoesNotMatchConfiguredRounds() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.countByJobIdAndCompanyIdAndIsDeletedFalse(10L, 20L)).thenReturn(1L);

        UpdateJobRequestDTO request = UpdateJobRequestDTO.builder()
                .title("No Interview Job")
                .roundCount(0)
                .build();

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.updateJob(10L, request, 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void updateRejectsRestrictedWorkspaceBeforeSaving() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        CompanyEntity company = CompanyEntity.builder()
                .id(20L)
                .status(CompanyStatus.PENDING)
                .build();
        UserEntity user = UserEntity.builder()
                .id(30L)
                .company(company)
                .status(UserStatus.ACTIVE)
                .email("hr@example.com")
                .fullName("HR")
                .build();
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(companyRepository.findById(20L)).thenReturn(Optional.of(company));
        when(userRepository.findByIdWithCompany(30L)).thenReturn(Optional.of(user));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.updateJob(10L, UpdateJobRequestDTO.builder()
                        .title("Updated title")
                        .build(), 20L, 30L)
        );

        assertEquals(403, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void publishMovesInactiveJobToActiveAndAuditsAction() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.INACTIVE));
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        var result = service.publishJob(10L, 20L, 30L);

        assertEquals("ACTIVE", result.getStatus());
        assertNotNull(result.getPublishedAt());
        verify(jobRepository).save(job);
        verify(auditService).recordTarget(30L, 20L, "JOB", 10L, "PUBLISH_JOB", "Publish Job: Publishable Job");
    }

    @Test
    void publishRejectsJobWithoutDescription() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        job.setDescription(" ");
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.publishJob(10L, 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void publishRejectsNegativeSalary() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        job.setSalaryMin(java.math.BigDecimal.valueOf(-1));
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.publishJob(10L, 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void publishRejectsSoftDeletedCategory() {
        JobCategoryEntity deletedCategory = category(1L, JobCategoryStatus.ACTIVE);
        deletedCategory.setIsDeleted(true);
        JobEntity job = publishableJob(10L, 20L, deletedCategory);
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.publishJob(10L, 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void closeMovesActiveJobToClosedWithoutChangingPublishedTimestamp() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        java.time.LocalDateTime publishedAt = java.time.LocalDateTime.now().minusDays(1);
        job.setStatus("ACTIVE");
        job.setPublishedAt(publishedAt);
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        var result = service.closeJob(10L, 20L, 30L);

        assertEquals("CLOSED", result.getStatus());
        assertEquals(publishedAt, result.getPublishedAt());
        assertNotNull(result.getClosedAt());
        verify(auditService).recordTarget(30L, 20L, "JOB", 10L, "CLOSE_JOB", "Đóng Job: Publishable Job");
    }

    @Test
    void closeRejectsInactiveJobWithConflict() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.closeJob(10L, 20L, 30L)
        );

        assertEquals(409, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void reopenMovesClosedJobToActiveAndClearsClosedAt() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.INACTIVE));
        job.setStatus("CLOSED");
        job.setClosedAt(java.time.LocalDateTime.now().minusDays(1));
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        var result = service.reopenJob(10L, 20L, 30L);

        assertEquals("ACTIVE", result.getStatus());
        assertNotNull(result.getPublishedAt());
        org.junit.jupiter.api.Assertions.assertNull(result.getClosedAt());
        verify(auditService).recordTarget(30L, 20L, "JOB", 10L, "REOPEN_JOB", "Mở lại Job: Publishable Job");
    }

    @Test
    void reopenRejectsActiveJobWithConflict() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        job.setStatus("ACTIVE");
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.reopenJob(10L, 20L, 30L)
        );

        assertEquals(409, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void transitionRejectsWrongCurrentState() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        job.setStatus("ACTIVE");
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.publishJob(10L, 20L, 30L)
        );

        assertEquals(409, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void transitionRejectsRestrictedCompany() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        CompanyEntity company = CompanyEntity.builder()
                .id(20L)
                .status(CompanyStatus.PENDING)
                .build();
        UserEntity user = UserEntity.builder()
                .id(30L)
                .company(company)
                .status(UserStatus.ACTIVE)
                .email("hr@example.com")
                .fullName("HR")
                .build();
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(companyRepository.findById(20L)).thenReturn(Optional.of(company));
        when(userRepository.findByIdWithCompany(30L)).thenReturn(Optional.of(user));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.publishJob(10L, 20L, 30L)
        );

        assertEquals(403, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void saveJobPipelineSynchronizesRoundCountAndSoftDeletesRemovedRounds() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        HiringRoundEntity kept = round(101L, job, 0);
        HiringRoundEntity removed = round(102L, job, 1);
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(10L, 20L))
                .thenReturn(List.of(kept, removed));
        when(applicationRepository.existsByJobIdAndCurrentRoundId(10L, 102L)).thenReturn(false);
        when(jobRepository.save(job)).thenReturn(job);

        SaveJobPipelineRequestDTO request = new SaveJobPipelineRequestDTO();
        request.setJob(UpdateJobRequestDTO.builder().title("Updated job").roundCount(1).build());
        PipelineRoundRequestDTO keptRequest = new PipelineRoundRequestDTO();
        keptRequest.setId(101L);
        keptRequest.setName("CV Screening");
        keptRequest.setIsFinalRound(false);
        request.setRounds(List.of(keptRequest));

        var result = service.saveJobPipeline(10L, request, 20L, 30L);

        assertEquals(true, removed.getIsDeleted());
        assertEquals(0, kept.getOrderIndex());
        assertEquals(1, job.getRoundCount());
        assertEquals(1, result.getRoundCount());
        verify(hiringRoundRepository).saveAllAndFlush(List.of(kept, removed));
        verify(hiringRoundRepository).saveAll(List.of(kept));
        verify(jobRepository).save(job);
        verify(auditService).recordTarget(30L, 20L, "JOB", 10L, "SAVE_JOB_PIPELINE", "Cập nhật thông tin Job và pipeline");
    }

    @Test
    void saveJobPipelineRejectsRoundCountMismatch() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        SaveJobPipelineRequestDTO request = new SaveJobPipelineRequestDTO();
        request.setJob(UpdateJobRequestDTO.builder().title("Updated job").roundCount(0).build());
        PipelineRoundRequestDTO round = new PipelineRoundRequestDTO();
        round.setName("CV Screening");
        request.setRounds(List.of(round));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.saveJobPipeline(10L, request, 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(hiringRoundRepository, never()).findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(any(), any());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void saveJobPipelineCannotRemoveRoundWithCurrentApplicant() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        HiringRoundEntity existingRound = round(101L, job, 0);
        stubActiveWorkspace(20L, 30L);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(10L, 20L))
                .thenReturn(List.of(existingRound));
        when(applicationRepository.existsByJobIdAndCurrentRoundId(10L, 101L)).thenReturn(true);

        SaveJobPipelineRequestDTO request = new SaveJobPipelineRequestDTO();
        request.setJob(UpdateJobRequestDTO.builder().title("Updated job").roundCount(0).build());
        request.setRounds(List.of());

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.saveJobPipeline(10L, request, 20L, 30L)
        );

        assertEquals(400, exception.getStatusCode());
        assertEquals(false, existingRound.getIsDeleted());
        verify(hiringRoundRepository, never()).saveAllAndFlush(any());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void saveJobPipelineChecksWorkspaceBeforeLoadingJob() {
        when(companyRepository.findById(20L)).thenReturn(Optional.empty());

        SaveJobPipelineRequestDTO request = new SaveJobPipelineRequestDTO();
        request.setJob(UpdateJobRequestDTO.builder().title("Updated job").roundCount(0).build());
        request.setRounds(List.of());

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.saveJobPipeline(10L, request, 20L, 30L)
        );

        assertEquals(403, exception.getStatusCode());
        verify(jobRepository, never()).findById(10L);
    }

    private HiringRoundEntity round(Long id, JobEntity job, int orderIndex) {
        return HiringRoundEntity.builder()
                .id(id)
                .job(job)
                .company(job.getCompany())
                .name("Round " + id)
                .orderIndex(orderIndex)
                .isFinalRound(false)
                .isDeleted(false)
                .build();
    }

    private void stubActiveWorkspace(Long companyId, Long userId) {
        CompanyEntity company = CompanyEntity.builder()
                .id(companyId)
                .status(CompanyStatus.ACTIVE)
                .build();
        UserEntity user = UserEntity.builder()
                .id(userId)
                .company(company)
                .status(UserStatus.ACTIVE)
                .email("hr@example.com")
                .fullName("HR")
                .build();
        when(companyRepository.findById(companyId)).thenReturn(Optional.of(company));
        when(userRepository.findByIdWithCompany(userId)).thenReturn(Optional.of(user));
    }

    private JobEntity job(Long id, Long companyId, JobCategoryEntity category) {
        return JobEntity.builder()
                .id(id)
                .company(CompanyEntity.builder().id(companyId).build())
                .category(category)
                .status("ACTIVE")
                .isDeleted(false)
                .title("Original title")
                .slug("original-title")
                .build();
    }

    private JobEntity publishableJob(Long id, Long companyId, JobCategoryEntity category) {
        return JobEntity.builder()
                .id(id)
                .company(CompanyEntity.builder().id(companyId).build())
                .category(category)
                .status("INACTIVE")
                .isDeleted(false)
                .title("Publishable Job")
                .slug("publishable-job")
                .description("A complete job description")
                .location("Hà Nội")
                .salaryMin(java.math.BigDecimal.valueOf(1000))
                .salaryMax(java.math.BigDecimal.valueOf(2000))
                .build();
    }

    private CreateJobRequestDTO createRequest() {
        return CreateJobRequestDTO.builder()
                .title("Senior Engineer")
                .categoryId(1L)
                .location("Hà Nội")
                .salaryMin(java.math.BigDecimal.valueOf(1000))
                .salaryMax(java.math.BigDecimal.valueOf(2000))
                .currency("USD")
                .workingType("HYBRID")
                .employmentType("FULL_TIME")
                .experienceLevel("SENIOR")
                .description("Description")
                .build();
    }

    private JobCategoryEntity category(Long id, JobCategoryStatus status) {
        return JobCategoryEntity.builder()
                .id(id)
                .name("Category " + id)
                .slug("category-" + id)
                .status(status)
                .isDeleted(false)
                .build();
    }
}
