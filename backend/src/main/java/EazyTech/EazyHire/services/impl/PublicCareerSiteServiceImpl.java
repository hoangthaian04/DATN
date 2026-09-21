package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.PublicApplicationFormResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicCategoryOptionResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicCompanyResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicCompanySummaryResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicFormFieldResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicJobDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicJobSummaryResponseDTO;
import EazyTech.EazyHire.models.entities.CareerSiteEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.CompanyProfileEntity;
import EazyTech.EazyHire.models.entities.FormFieldEntity;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import EazyTech.EazyHire.repositories.CareerSiteRepository;
import EazyTech.EazyHire.repositories.CompanyProfileRepository;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.FormFieldRepository;
import EazyTech.EazyHire.repositories.JobCategoryRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.PublicCareerSiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PublicCareerSiteServiceImpl implements PublicCareerSiteService {

    private static final int DEFAULT_PAGE_SIZE = 20;
    private static final int MAX_PAGE_SIZE = 100;

    private final CompanyRepository companyRepository;
    private final CompanyProfileRepository companyProfileRepository;
    private final CareerSiteRepository careerSiteRepository;
    private final FormFieldRepository formFieldRepository;
    private final JobCategoryRepository jobCategoryRepository;
    private final JobRepository jobRepository;

    @Override
    public PublicCompanyResponseDTO getCompany(String companySlug) {
        PublicSiteContext context = requirePublishedSite(companySlug);
        return mapCompany(context.company(), context.profile(), context.careerSite());
    }

    @Override
    public Page<PublicJobSummaryResponseDTO> getJobs(
            String companySlug,
            String keyword,
            String location,
            String categorySlug,
            Integer page,
            Integer limit
    ) {
        requirePublishedSite(companySlug);
        int safePage = validatePage(page);
        int safeLimit = validateLimit(limit);

        return jobRepository.findPublicJobs(
                normalizeRequired(companySlug),
                normalizeFilter(keyword),
                normalizeFilter(location),
                normalizeFilter(categorySlug),
                PageRequest.of(safePage - 1, safeLimit)
        );
    }

    @Override
    public PublicJobDetailResponseDTO getJob(String companySlug, String jobSlug) {
        PublicSiteContext context = requirePublishedSite(companySlug);
        JobEntity job = jobRepository.findPublicJob(
                        normalizeRequired(companySlug),
                        normalizeRequired(jobSlug)
                )
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy tin tuyển dụng public"));

        List<PublicFormFieldResponseDTO> fields = formFieldRepository
                .findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(
                        job.getId(),
                        context.company().getId()
                )
                .stream()
                .map(this::mapPublicFormField)
                .toList();

        return mapJobDetail(
                job,
                mapCompanySummary(context.company(), context.profile(), context.careerSite()),
                fields
        );
    }

    private PublicSiteContext requirePublishedSite(String companySlug) {
        String normalizedSlug = normalizeRequired(companySlug);
        CompanyEntity company = companyRepository.findBySlug(normalizedSlug)
                .orElseThrow(() -> new CustomException(404, "Career Site không khả dụng"));

        CareerSiteEntity careerSite = careerSiteRepository.findByCompanyId(company.getId()).orElse(null);
        if (company.getStatus() != CompanyStatus.ACTIVE
                || careerSite == null
                || !Boolean.TRUE.equals(careerSite.getIsPublished())) {
            throw new CustomException(404, "Career Site không khả dụng");
        }

        CompanyProfileEntity profile = companyProfileRepository.findByCompanyId(company.getId()).orElse(null);
        return new PublicSiteContext(company, profile, careerSite);
    }

    private PublicCompanyResponseDTO mapCompany(
            CompanyEntity company,
            CompanyProfileEntity profile,
            CareerSiteEntity careerSite
    ) {
        List<PublicCategoryOptionResponseDTO> categories = jobCategoryRepository
                .findByStatusAndIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc(JobCategoryStatus.ACTIVE)
                .stream()
                .map(this::mapCategory)
                .toList();

        return PublicCompanyResponseDTO.builder()
                .id(company.getId())
                .companyName(company.getName())
                .companySlug(company.getSlug())
                .logoUrl(firstNonBlank(careerSite.getLogoUrl(), profile != null ? profile.getLogoUrl() : null))
                .bannerUrl(firstNonBlank(careerSite.getHeroImageUrl(), profile != null ? profile.getBannerUrl() : null))
                .siteTitle(firstNonBlank(careerSite.getSiteTitle(), company.getName()))
                .tagline(careerSite.getTagline())
                .description(Boolean.TRUE.equals(careerSite.getShowCompanyDescription())
                        && profile != null ? profile.getDescription() : null)
                .website(company.getWebsite())
                .publicEmail(company.getEmail())
                .publicPhone(company.getPhone())
                .primaryColor(firstNonBlank(profile != null ? profile.getPrimaryColor() : null, "#2563eb"))
                .accentColor(firstNonBlank(careerSite.getAccentColor(), "#2563eb"))
                .categories(categories)
                .build();
    }

    private PublicCompanySummaryResponseDTO mapCompanySummary(
            CompanyEntity company,
            CompanyProfileEntity profile,
            CareerSiteEntity careerSite
    ) {
        return PublicCompanySummaryResponseDTO.builder()
                .id(company.getId())
                .companyName(company.getName())
                .companySlug(company.getSlug())
                .logoUrl(firstNonBlank(careerSite.getLogoUrl(), profile != null ? profile.getLogoUrl() : null))
                .build();
    }

    private PublicCategoryOptionResponseDTO mapCategory(JobCategoryEntity category) {
        return PublicCategoryOptionResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .build();
    }

    private PublicFormFieldResponseDTO mapPublicFormField(FormFieldEntity field) {
        return PublicFormFieldResponseDTO.builder()
                .id(field.getId())
                .fieldName(field.getFieldName())
                .label(field.getLabel())
                .fieldType(field.getFieldType().name())
                .required(Boolean.TRUE.equals(field.getIsRequired()))
                .options(field.getOptions() == null ? List.of() : field.getOptions())
                .displayOrder(field.getOrderIndex())
                .build();
    }

    private PublicJobDetailResponseDTO mapJobDetail(
            JobEntity job,
            PublicCompanySummaryResponseDTO company,
            List<PublicFormFieldResponseDTO> formFields
    ) {
        return PublicJobDetailResponseDTO.builder()
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
                .categoryName(job.getCategory() != null ? job.getCategory().getName() : null)
                .categorySlug(job.getCategory() != null ? job.getCategory().getSlug() : null)
                .publishedAt(job.getPublishedAt())
                .startDate(job.getStartDate())
                .endDate(job.getEndDate())
                .company(company)
                .applicationForm(PublicApplicationFormResponseDTO.builder().fields(formFields).build())
                .build();
    }

    private int validatePage(Integer page) {
        if (page == null) return 1;
        if (page < 1) throw new CustomException(400, "page phải là số lớn hơn 0");
        return page;
    }

    private int validateLimit(Integer limit) {
        if (limit == null) return DEFAULT_PAGE_SIZE;
        if (limit < 1 || limit > MAX_PAGE_SIZE) {
            throw new CustomException(400, "limit phải nằm trong khoảng từ 1 đến " + MAX_PAGE_SIZE);
        }
        return limit;
    }

    private String normalizeRequired(String value) {
        if (value == null || value.isBlank()) {
            throw new CustomException(400, "Tham số public không được để trống");
        }
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String normalizeFilter(String value) {
        if (value == null || value.isBlank()) return "";
        return value.trim().toLowerCase(Locale.ROOT);
    }

    private String firstNonBlank(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private record PublicSiteContext(
            CompanyEntity company,
            CompanyProfileEntity profile,
            CareerSiteEntity careerSite
    ) {
    }
}
