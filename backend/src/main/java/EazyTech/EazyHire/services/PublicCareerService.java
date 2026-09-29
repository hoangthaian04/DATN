package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.PublicCompanyDTO;
import EazyTech.EazyHire.models.dtos.PublicJobDTO;
import java.util.List;

public interface PublicCareerService {
    PublicCompanyDTO getCompanySite(String companySlug);
    List<PublicJobDTO> getCompanyJobs(String companySlug, String search);
    PublicJobDTO getJobDetail(String companySlug, String jobSlug);
}
