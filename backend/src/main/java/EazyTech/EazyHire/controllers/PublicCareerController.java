package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import EazyTech.EazyHire.services.PublicCareerService;
import org.springframework.web.bind.annotation.RequestParam ;
@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicCareerController {

    private final PublicCareerService publicCareerService;

    @GetMapping("/companies/{companySlug}")
    public BaseResponse getCompanySite(@PathVariable String companySlug) {
        return BaseResponse.success("Lấy thông tin công ty thành công", publicCareerService.getCompanySite(companySlug));
    }

    @GetMapping("/companies/{companySlug}/jobs")
    public BaseResponse getCompanyJobs(@PathVariable String companySlug, @RequestParam(required = false) String search) {
        return BaseResponse.success("Lấy danh sách việc làm thành công", publicCareerService.getCompanyJobs(companySlug, search));
    }

    @GetMapping("/companies/{companySlug}/jobs/{jobSlug}")
    public BaseResponse getJobDetail(@PathVariable String companySlug, @PathVariable String jobSlug) {
        return BaseResponse.success("Lấy thông tin công việc thành công", publicCareerService.getJobDetail(companySlug, jobSlug));
    }
}
