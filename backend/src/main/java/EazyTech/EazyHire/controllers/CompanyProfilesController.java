package EazyTech.EazyHire.controllers;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.models.dtos.*;
import EazyTech.EazyHire.services.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
@RestController @RequiredArgsConstructor
public class CompanyProfilesController {
 private final CompanyService companies;
 @GetMapping({"/api/v1/companies/me","/api/v1/company-profiles/me"})
 public BaseResponse get(){return BaseResponse.success("Lấy thông tin công ty thành công",companies.getMyCompany(AuthController.currentId()));}
 @PatchMapping("/api/v1/company-profiles/me")
 public BaseResponse update(@Valid @RequestBody OnboardingRequestDTO request){return BaseResponse.success("Cập nhật hồ sơ công ty thành công",companies.updateProfile(AuthController.currentId(),request));}
 @PostMapping("/api/v1/company-profiles/me/logo")
 public BaseResponse upload(@RequestParam("file") MultipartFile file){return BaseResponse.success("Tải logo công ty thành công",companies.uploadLogo(AuthController.currentId(),file));}
 @PostMapping("/api/v1/companies/me/resubmit")
 public BaseResponse resubmit(@Valid @RequestBody RegistrationUpdateRequestDTO request){return BaseResponse.success("Gửi lại hồ sơ thành công",companies.resubmit(AuthController.currentId(),request));}
}
