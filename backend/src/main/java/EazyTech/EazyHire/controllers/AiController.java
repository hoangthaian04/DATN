package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.JobDescriptionSuggestionRequestDTO;
import EazyTech.EazyHire.models.dtos.JobDescriptionSuggestionResponseDTO;
import EazyTech.EazyHire.services.AiJobDescriptionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/ai")
@RequiredArgsConstructor
public class AiController {

    private final AiJobDescriptionService aiJobDescriptionService;

    @PostMapping("/job-description/suggest")
    @PreAuthorize("hasAnyRole('HR', 'HR_ADMIN')")
    public ResponseEntity<BaseResponse> suggestJobDescription(
            @Valid @RequestBody JobDescriptionSuggestionRequestDTO request
    ) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
        JobDescriptionSuggestionResponseDTO suggestion = aiJobDescriptionService
                .suggest(request, user.getCompanyId());
        return ResponseEntity.ok(new BaseResponse(1, "Tạo gợi ý JD thành công", suggestion));
    }
}
