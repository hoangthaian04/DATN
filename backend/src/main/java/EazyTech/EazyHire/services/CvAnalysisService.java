package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.CvAnalysisRequestDTO;
import EazyTech.EazyHire.models.dtos.CvAnalysisResponseDTO;

import java.util.Optional;

public interface CvAnalysisService {

    CvAnalysisResponseDTO analyze(
            Long applicationId,
            Long companyId,
            CvAnalysisRequestDTO request
    );

    Optional<CvAnalysisResponseDTO> getLatest(
            Long applicationId,
            Long companyId
    );
}
