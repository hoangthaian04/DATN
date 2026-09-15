package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.PublicCompanyResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicJobDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.PublicJobSummaryResponseDTO;
import org.springframework.data.domain.Page;

public interface PublicCareerSiteService {

    PublicCompanyResponseDTO getCompany(String companySlug);

    Page<PublicJobSummaryResponseDTO> getJobs(
            String companySlug,
            String keyword,
            String location,
            String categorySlug,
            Integer page,
            Integer limit
    );

    PublicJobDetailResponseDTO getJob(String companySlug, String jobSlug);
}
