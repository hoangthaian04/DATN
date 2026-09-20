package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.PublicApplicationResponseDTO;
import org.springframework.web.multipart.MultipartFile;

public interface PublicApplicationService {

    PublicApplicationResponseDTO apply(
            Long jobId,
            String fullName,
            String email,
            String phone,
            String coverLetter,
            MultipartFile cvFile,
            String answers,
            Boolean consentAccepted
    );
}
