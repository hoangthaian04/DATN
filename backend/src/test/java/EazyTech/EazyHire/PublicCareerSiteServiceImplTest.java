package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.PublicJobSummaryResponseDTO;
import EazyTech.EazyHire.models.entities.CareerSiteEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.CompanyProfileEntity;
import EazyTech.EazyHire.models.entities.FormFieldEntity;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.FormFieldType;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import EazyTech.EazyHire.repositories.CareerSiteRepository;
import EazyTech.EazyHire.repositories.CompanyProfileRepository;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.FormFieldRepository;
import EazyTech.EazyHire.repositories.JobCategoryRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.impl.PublicCareerSiteServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PublicCareerSiteServiceImplTest {

    @Mock
    private CompanyRepository companyRepository;

    @Mock
    private CompanyProfileRepository companyProfileRepository;

    @Mock
    private CareerSiteRepository careerSiteRepository;

    @Mock
    private FormFieldRepository formFieldRepository;

    @Mock
    private JobCategoryRepository jobCategoryRepository;

    @Mock
    private JobRepository jobRepository;

    @InjectMocks
    private PublicCareerSiteServiceImpl service;

    @Test
    void getCompanyReturnsOnlyPublishedActiveSiteAndActiveCategories() {
        CompanyEntity company = company();
        CompanyProfileEntity profile = CompanyProfileEntity.builder()
                .id(11L)
                .logoUrl("profile-logo.png")
                .description("Company description")
                .primaryColor("#123456")
                .build();
        CareerSiteEntity site = CareerSiteEntity.builder()
                .id(12L)
                .company(company)
                .siteTitle("EasyTech Careers")
                .logoUrl("career-logo.png")
                .isPublished(true)
                .build();
        JobCategoryEntity category = category(5L, JobCategoryStatus.ACTIVE, false);

        when(companyRepository.findBySlug("easytech")).thenReturn(Optional.of(company));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(site));
        when(companyProfileRepository.findByCompanyId(1L)).thenReturn(Optional.of(profile));
        when(jobCategoryRepository.findByStatusAndIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc(JobCategoryStatus.ACTIVE))
                .thenReturn(List.of(category));

        var result = service.getCompany(" EasyTech ");

        assertEquals("EasyTech Careers", result.getSiteTitle());
        assertEquals("career-logo.png", result.getLogoUrl());
        assertEquals("Company description", result.getDescription());
        assertEquals("technology", result.getCategories().get(0).getSlug());
    }

    @Test
    void getCompanyRejectsUnpublishedSiteWithoutExposingCompanyData() {
        CompanyEntity company = company();
        CareerSiteEntity site = CareerSiteEntity.builder()
                .company(company)
                .isPublished(false)
                .build();
        when(companyRepository.findBySlug("easytech")).thenReturn(Optional.of(company));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(site));

        CustomException exception = assertThrows(CustomException.class, () -> service.getCompany("easytech"));

        assertEquals(404, exception.getStatusCode());
        verify(companyProfileRepository, never()).findByCompanyId(any());
        verify(jobCategoryRepository, never()).findByStatusAndIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc(any());
    }

    @Test
    void getJobsUsesPageOneAndPublicFilters() {
        CompanyEntity company = company();
        CareerSiteEntity site = CareerSiteEntity.builder().company(company).isPublished(true).build();
        PublicJobSummaryResponseDTO job = PublicJobSummaryResponseDTO.builder().id(20L).title("Frontend Engineer").build();

        when(companyRepository.findBySlug("easytech")).thenReturn(Optional.of(company));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(site));
        when(companyProfileRepository.findByCompanyId(1L)).thenReturn(Optional.empty());
        when(jobRepository.findPublicJobs(eq("easytech"), eq("frontend"), eq("hcm"), eq("technology"), eq(PageRequest.of(0, 20))))
                .thenReturn(new PageImpl<>(List.of(job), PageRequest.of(0, 20), 1));

        var result = service.getJobs("easytech", " Frontend ", " HCM ", " Technology ", 1, 20);

        assertEquals(1, result.getTotalElements());
        assertEquals("Frontend Engineer", result.getContent().get(0).getTitle());
        verify(jobRepository).findPublicJobs(eq("easytech"), eq("frontend"), eq("hcm"), eq("technology"), eq(PageRequest.of(0, 20)));
    }

    @Test
    void getJobsNormalizesMissingFiltersToEmptyStrings() {
        CompanyEntity company = company();
        CareerSiteEntity site = CareerSiteEntity.builder().company(company).isPublished(true).build();

        when(companyRepository.findBySlug("easytech")).thenReturn(Optional.of(company));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(site));
        when(companyProfileRepository.findByCompanyId(1L)).thenReturn(Optional.empty());
        when(jobRepository.findPublicJobs(eq("easytech"), eq(""), eq(""), eq(""), eq(PageRequest.of(0, 20))))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        var result = service.getJobs("easytech", null, null, null, null, null);

        assertEquals(0, result.getTotalElements());
        verify(jobRepository).findPublicJobs(eq("easytech"), eq(""), eq(""), eq(""), eq(PageRequest.of(0, 20)));
    }

    @Test
    void getJobsReturnsEmptyPageForInactiveCategoryFilter() {
        CompanyEntity company = company();
        CareerSiteEntity site = CareerSiteEntity.builder().company(company).isPublished(true).build();

        when(companyRepository.findBySlug("easytech")).thenReturn(Optional.of(company));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(site));
        when(companyProfileRepository.findByCompanyId(1L)).thenReturn(Optional.empty());
        when(jobRepository.findPublicJobs(eq("easytech"), eq(""), eq(""), eq("inactive-category"), eq(PageRequest.of(0, 20))))
                .thenReturn(new PageImpl<>(List.of(), PageRequest.of(0, 20), 0));

        var result = service.getJobs("easytech", null, null, " Inactive-Category ", 1, 20);

        assertEquals(0, result.getTotalElements());
        verify(jobRepository).findPublicJobs(
                eq("easytech"), eq(""), eq(""), eq("inactive-category"), eq(PageRequest.of(0, 20))
        );
    }

    @Test
    void getJobsRejectsInvalidPagination() {
        CompanyEntity company = company();
        CareerSiteEntity site = CareerSiteEntity.builder().company(company).isPublished(true).build();
        when(companyRepository.findBySlug("easytech")).thenReturn(Optional.of(company));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(site));
        when(companyProfileRepository.findByCompanyId(1L)).thenReturn(Optional.empty());

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.getJobs("easytech", null, null, null, 1, 101)
        );

        assertEquals(400, exception.getStatusCode());
        verify(jobRepository, never()).findPublicJobs(any(), any(), any(), any(), any());
    }

    @Test
    void getJobMapsPublicDetailForTheRequestedCompany() {
        CompanyEntity company = company();
        CareerSiteEntity site = CareerSiteEntity.builder().company(company).isPublished(true).build();
        JobEntity job = JobEntity.builder()
                .id(20L)
                .company(company)
                .category(category(5L, JobCategoryStatus.INACTIVE, false))
                .title("Frontend Engineer")
                .slug("frontend-engineer")
                .description("Build the product")
                .salaryMin(BigDecimal.valueOf(1000))
                .salaryMax(BigDecimal.valueOf(2000))
                .status("ACTIVE")
                .isDeleted(false)
                .build();

        when(companyRepository.findBySlug("easytech")).thenReturn(Optional.of(company));
        when(careerSiteRepository.findByCompanyId(1L)).thenReturn(Optional.of(site));
        when(companyProfileRepository.findByCompanyId(1L)).thenReturn(Optional.empty());
        when(jobRepository.findPublicJob("easytech", "frontend-engineer")).thenReturn(Optional.of(job));
        FormFieldEntity portfolioField = FormFieldEntity.builder()
                .id(31L)
                .company(company)
                .job(job)
                .fieldName("portfolio_url")
                .label("Portfolio URL")
                .fieldType(FormFieldType.URL)
                .isRequired(false)
                .options(List.of())
                .orderIndex(0)
                .isDeleted(false)
                .build();
        when(formFieldRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(20L, 1L))
                .thenReturn(List.of(portfolioField));

        var result = service.getJob("easytech", "frontend-engineer");

        assertEquals(20L, result.getId());
        assertEquals("EasyTech", result.getCompany().getCompanyName());
        assertEquals("technology", result.getCategorySlug());
        assertEquals(1, result.getApplicationForm().getFields().size());
        assertEquals("portfolio_url", result.getApplicationForm().getFields().get(0).getFieldName());
    }

    private CompanyEntity company() {
        return CompanyEntity.builder()
                .id(1L)
                .name("EasyTech")
                .slug("easytech")
                .status(CompanyStatus.ACTIVE)
                .build();
    }

    private JobCategoryEntity category(Long id, JobCategoryStatus status, boolean deleted) {
        return JobCategoryEntity.builder()
                .id(id)
                .name("Technology")
                .slug("technology")
                .status(status)
                .isDeleted(deleted)
                .build();
    }
}
