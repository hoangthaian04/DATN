package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.PublicCompanyDTO;
import EazyTech.EazyHire.models.dtos.PublicJobDTO;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.CompanyProfileEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.PublicCareerService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PublicCareerServiceImpl implements PublicCareerService {

    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;

    @Override
    public PublicCompanyDTO getCompanySite(String companySlug) {
        CompanyEntity company = companyRepository.findBySlug(companySlug)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy công ty"));

        CompanyProfileEntity profile = company.getProfile();

        List<String> businessSectors = new ArrayList<>();
        List<String> mainSector = new ArrayList<>();
        if (profile != null && profile.getIndustry() != null) {
            businessSectors.add(profile.getIndustry());
            mainSector.add(profile.getIndustry());
        }

        return PublicCompanyDTO.builder()
                .name(company.getName())
                .slug(company.getSlug())
                .website(company.getWebsite())
                .location(company.getAddress())
                .size(profile != null ? profile.getCompanySize() : "Chưa cập nhật")
                .founded("Chưa cập nhật")
                .email(company.getEmail())
                .slogan(profile != null && profile.getSlogan() != null ? profile.getSlogan() : "")
                .averageAge("Chưa cập nhật")
                .businessSectors(businessSectors)
                .mainSector(mainSector)
                .services(new ArrayList<>())
                .description(profile != null ? profile.getDescription() : "")
                .fullDescription(Arrays.asList(profile != null && profile.getDescription() != null ? profile.getDescription() : ""))
                .footer(PublicCompanyDTO.FooterDTO.builder()
                        .description("Tuyển dụng bởi EasyTech")
                        .facebook("")
                        .linkedin("")
                        .copyright("© " + company.getName())
                        .build())
                .logoUrl(profile != null ? profile.getLogoUrl() : "")
                .bannerUrl(profile != null ? profile.getBannerUrl() : "")
                .primaryColor(profile != null ? profile.getPrimaryColor() : "#2563eb")
                .build();
    }

    @Override
    public List<PublicJobDTO> getCompanyJobs(String companySlug, String search) {
        CompanyEntity company = companyRepository.findBySlug(companySlug)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy công ty"));

        List<JobEntity> jobs = jobRepository.findByCompanyIdAndStatusAndSearchKeyword(company.getId(), "ACTIVE", search);

        return jobs.stream().map(this::mapToPublicJobDTO).collect(Collectors.toList());
    }

    @Override
    public PublicJobDTO getJobDetail(String companySlug, String jobSlug) {
        CompanyEntity company = companyRepository.findBySlug(companySlug)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy công ty"));

        JobEntity job = jobRepository.findByCompanyIdAndSlugAndIsDeletedFalse(company.getId(), jobSlug)
                .orElseThrow(() -> new CustomException(HttpStatus.NOT_FOUND.value(), "Không tìm thấy công việc"));

        return mapToPublicJobDTO(job);
    }

    private PublicJobDTO mapToPublicJobDTO(JobEntity job) {
        return PublicJobDTO.builder()
                .id(job.getId().toString())
                .slug(job.getSlug())
                .title(job.getTitle())
                .location(job.getLocation())
                .type(job.getEmploymentType() != null ? job.getEmploymentType() : job.getWorkingType())
                .salary(job.getSalaryMin() != null && job.getSalaryMax() != null ? job.getSalaryMin() + "-" + job.getSalaryMax() + " " + job.getCurrency() : "Thỏa thuận")
                .category("Kỹ thuật / AI") // Mocking category for now
                .postedAt(job.getPublishedAt() != null ? job.getPublishedAt().toLocalDate().toString() : job.getCreatedAt().toLocalDate().toString())
                .tags(job.getExperienceLevel() != null ? Arrays.asList(job.getExperienceLevel()) : Arrays.asList("Backend", "Frontend"))
                .description(job.getDescription())
                .requirements(job.getRequirements() != null ? Arrays.asList(job.getRequirements().split("\n")) : new ArrayList<>())
                .benefits(job.getBenefits() != null ? Arrays.asList(job.getBenefits().split("\n")) : new ArrayList<>())
                .requiresCv(true)
                .build();
    }
}
