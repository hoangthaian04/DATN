package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.models.dtos.PublicApplicationResponseDTO;
import EazyTech.EazyHire.services.PublicApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/public/jobs")
@RequiredArgsConstructor
public class PublicApplicationController {

    private final PublicApplicationService publicApplicationService;

    @PostMapping(value = "/{jobId}/applications", consumes = "multipart/form-data")
    public ResponseEntity<BaseResponse> apply(
            @PathVariable Long jobId,
            @RequestParam(name = "fullName", required = false) String fullName,
            @RequestParam(name = "email", required = false) String email,
            @RequestParam(name = "phone", required = false) String phone,
            @RequestParam(name = "coverLetter", required = false) String coverLetter,
            @RequestParam(name = "cvFile", required = false) MultipartFile cvFile,
            @RequestParam(name = "answers", required = false, defaultValue = "[]") String answers,
            @RequestParam(name = "consentAccepted", required = false, defaultValue = "false") Boolean consentAccepted
    ) {
        PublicApplicationResponseDTO result = publicApplicationService.apply(
                jobId, fullName, email, phone, coverLetter, cvFile, answers, consentAccepted
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(BaseResponse.success("Nộp CV thành công", result));
    }
}
