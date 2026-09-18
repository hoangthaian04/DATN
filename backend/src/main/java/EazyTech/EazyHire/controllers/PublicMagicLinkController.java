package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.models.dtos.MagicLinkRecoveryRequestDTO;
import EazyTech.EazyHire.models.dtos.MagicLinkVerifyRequestDTO;
import EazyTech.EazyHire.models.dtos.PublicApplicationStatusResponseDTO;
import EazyTech.EazyHire.services.PublicMagicLinkService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class PublicMagicLinkController {

    private final PublicMagicLinkService publicMagicLinkService;

    @PostMapping("/api/v1/candidates/verify-magic-link")
    public ResponseEntity<BaseResponse> verify(@Valid @RequestBody MagicLinkVerifyRequestDTO request) {
        PublicApplicationStatusResponseDTO result = publicMagicLinkService.verify(
                request.getToken(), request.getEmail());
        return ResponseEntity.ok(BaseResponse.success("Xác thực magic link thành công.", result));
    }

    @GetMapping("/api/v1/candidates/application-status")
    public ResponseEntity<BaseResponse> status(
            @RequestParam String token,
            @RequestParam String email
    ) {
        PublicApplicationStatusResponseDTO result = publicMagicLinkService.getStatus(token, email);
        return ResponseEntity.ok(BaseResponse.success("Lấy trạng thái hồ sơ ứng tuyển thành công.", result));
    }

    @PostMapping("/api/v1/public/applications/magic-link/request")
    public ResponseEntity<BaseResponse> requestRecovery(
            @Valid @RequestBody MagicLinkRecoveryRequestDTO request
    ) {
        publicMagicLinkService.requestRecovery(request.getEmail(), request.getCompanySlug());
        return ResponseEntity.ok(BaseResponse.success(
                "Nếu email của bạn đã ứng tuyển tại công ty, chúng tôi đã gửi liên kết tra cứu tới hộp thư của bạn."
        ));
    }
}
