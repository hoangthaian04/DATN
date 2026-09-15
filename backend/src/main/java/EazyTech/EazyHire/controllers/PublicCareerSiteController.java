package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.BasePagination;
import EazyTech.EazyHire.services.PublicCareerSiteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public")
@RequiredArgsConstructor
public class PublicCareerSiteController {

    private final PublicCareerSiteService publicCareerSiteService;

    @GetMapping("/companies/{companySlug}")
    public ResponseEntity<BaseResponse> getCompany(@PathVariable String companySlug) {
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy thông tin Career Site thành công",
                publicCareerSiteService.getCompany(companySlug)
        ));
    }

    @GetMapping("/companies/{companySlug}/jobs")
    public ResponseEntity<BaseResponse> getJobs(
            @PathVariable String companySlug,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "1") Integer page,
            @RequestParam(defaultValue = "20") Integer limit
    ) {
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy danh sách tin tuyển dụng public thành công",
                new BasePagination<>(publicCareerSiteService.getJobs(
                        companySlug, keyword, location, category, page, limit
                ))
        ));
    }

    @GetMapping("/companies/{companySlug}/jobs/{jobSlug}")
    public ResponseEntity<BaseResponse> getJob(
            @PathVariable String companySlug,
            @PathVariable String jobSlug
    ) {
        return ResponseEntity.ok(BaseResponse.success(
                "Lấy chi tiết tin tuyển dụng public thành công",
                publicCareerSiteService.getJob(companySlug, jobSlug)
        ));
    }
}
