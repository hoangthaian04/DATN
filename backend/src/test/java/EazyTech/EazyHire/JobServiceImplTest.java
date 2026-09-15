package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.UpdateJobRequestDTO;
import EazyTech.EazyHire.models.dtos.CreateJobRequestDTO;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.JobCategoryRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.services.impl.JobServiceImpl;
import EazyTech.EazyHire.services.AuditService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

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

    @InjectMocks
    private JobServiceImpl service;

    @Test
    void createJobUsesActiveCategoryAndStartsInactive() {
        CompanyEntity company = CompanyEntity.builder().id(20L).build();
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
        CompanyEntity company = CompanyEntity.builder().id(20L).build();
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
    void updateRejectsInactiveOrDeletedCategory() {
        JobEntity job = job(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobCategoryRepository.findByIdAndStatusAndIsDeletedFalse(2L, JobCategoryStatus.ACTIVE))
                .thenReturn(Optional.empty());

        UpdateJobRequestDTO request = UpdateJobRequestDTO.builder()
                .categoryId(2L)
                .title("Updated title")
                .build();

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.updateJob(10L, request, 20L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
    }

    @Test
    void updatePreservesExistingInactiveCategoryWhenCategoryIsOmitted() {
        JobCategoryEntity inactive = category(1L, JobCategoryStatus.INACTIVE);
        JobEntity job = job(10L, 20L, inactive);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        UpdateJobRequestDTO request = UpdateJobRequestDTO.builder()
                .title("Updated title")
                .build();

        var result = service.updateJob(10L, request, 20L);

        assertSame(inactive, job.getCategory());
        assertEquals(1L, result.getCategoryId());
        assertEquals("INACTIVE", inactive.getStatus().name());
        verify(jobCategoryRepository, never())
                .findByIdAndStatusAndIsDeletedFalse(any(), any());
    }

    @Test
    void updateChangesCategoryOnlyWhenItIsActiveAndNotDeleted() {
        JobCategoryEntity current = category(1L, JobCategoryStatus.ACTIVE);
        JobCategoryEntity replacement = category(2L, JobCategoryStatus.ACTIVE);
        JobEntity job = job(10L, 20L, current);
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobCategoryRepository.findByIdAndStatusAndIsDeletedFalse(2L, JobCategoryStatus.ACTIVE))
                .thenReturn(Optional.of(replacement));
        when(jobRepository.save(job)).thenReturn(job);

        UpdateJobRequestDTO request = UpdateJobRequestDTO.builder()
                .categoryId(2L)
                .title("Updated title")
                .build();

        var result = service.updateJob(10L, request, 20L);

        assertSame(replacement, job.getCategory());
        assertEquals(2L, result.getCategoryId());
        verify(jobRepository).save(job);
    }

    @Test
    void publishMovesInactiveJobToActiveAndAuditsAction() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.INACTIVE));
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
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        var result = service.closeJob(10L, 20L, 30L);

        assertEquals("CLOSED", result.getStatus());
        assertEquals(publishedAt, result.getPublishedAt());
        assertNotNull(result.getClosedAt());
        verify(auditService).recordTarget(30L, 20L, "JOB", 10L, "CLOSE_JOB", "Đóng Job: Publishable Job");
    }

    @Test
    void reopenMovesClosedJobToActiveAndClearsClosedAt() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.INACTIVE));
        job.setStatus("CLOSED");
        job.setClosedAt(java.time.LocalDateTime.now().minusDays(1));
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));
        when(jobRepository.save(job)).thenReturn(job);

        var result = service.reopenJob(10L, 20L, 30L);

        assertEquals("ACTIVE", result.getStatus());
        assertNotNull(result.getPublishedAt());
        org.junit.jupiter.api.Assertions.assertNull(result.getClosedAt());
        verify(auditService).recordTarget(30L, 20L, "JOB", 10L, "REOPEN_JOB", "Mở lại Job: Publishable Job");
    }

    @Test
    void transitionRejectsWrongCurrentState() {
        JobEntity job = publishableJob(10L, 20L, category(1L, JobCategoryStatus.ACTIVE));
        job.setStatus("ACTIVE");
        when(jobRepository.findById(10L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.publishJob(10L, 20L, 30L)
        );

        assertEquals(409, exception.getStatusCode());
        verify(jobRepository, never()).save(any(JobEntity.class));
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
