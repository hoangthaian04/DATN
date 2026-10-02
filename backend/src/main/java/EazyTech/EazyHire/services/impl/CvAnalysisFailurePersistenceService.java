package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.CvAnalysisEntity;
import EazyTech.EazyHire.models.enums.AiProviderSource;
import EazyTech.EazyHire.models.enums.CvAnalysisStatus;
import EazyTech.EazyHire.repositories.CvAnalysisRepository;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CvAnalysisFailurePersistenceService {

    private final CvAnalysisRepository cvAnalysisRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void saveFailure(
            ApplicationEntity application,
            ResolvedAiProvider provider,
            String errorMessage
    ) {
        if (application == null || application.getId() == null || application.getJob() == null
                || application.getCompany() == null) {
            return;
        }

        cvAnalysisRepository.save(CvAnalysisEntity.builder()
                .companyId(application.getCompany().getId())
                .applicationId(application.getId())
                .jobId(application.getJob().getId())
                .providerCode(provider == null ? "GEMINI" : provider.providerCode())
                .providerSource(provider == null ? AiProviderSource.SYSTEM_DEFAULT : provider.source())
                .modelName(provider == null ? null : provider.model())
                .status(CvAnalysisStatus.FAILED)
                .errorMessage(limit(errorMessage))
                .matchedSkills(List.of())
                .missingSkills(List.of())
                .strengths(List.of())
                .weaknesses(List.of())
                .build());
    }

    private String limit(String value) {
        if (value == null || value.isBlank()) return "Không thể hoàn tất phân tích CV";
        return value.length() > 2000 ? value.substring(0, 2000) : value;
    }
}
