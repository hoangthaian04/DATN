package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.entities.AiProviderEntity;
import EazyTech.EazyHire.models.enums.AiProviderSource;
import EazyTech.EazyHire.models.enums.AiProviderStatus;
import EazyTech.EazyHire.repositories.AiProviderRepository;
import EazyTech.EazyHire.services.AiProviderResolver;
import EazyTech.EazyHire.services.AiSecretCipher;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AiProviderResolverImpl implements AiProviderResolver {

    private static final String GEMINI = "GEMINI";

    private final AiProviderRepository aiProviderRepository;
    private final AiSecretCipher aiSecretCipher;

    @Value("${gemini.api-key:}")
    private String systemApiKey;

    @Value("${gemini.model:gemini-3.8-flash}")
    private String defaultModel;

    @Override
    public ResolvedAiProvider resolve(Long companyId) {
        if (companyId != null) {
            AiProviderEntity customProvider = aiProviderRepository
                    .findFirstByCompanyIdAndProviderCodeAndStatus(companyId, GEMINI, AiProviderStatus.ACTIVE)
                    .orElse(null);
            if (customProvider != null) {
                String customKey = aiSecretCipher.decrypt(customProvider.getApiKeyEncrypted());
                if (hasText(customKey)) {
                    return toResolved(customProvider, customKey, AiProviderSource.CUSTOM);
                }
            }
        }

        AiProviderEntity systemProvider = aiProviderRepository
                .findFirstByCompanyIdIsNullAndProviderCodeAndStatus(GEMINI, AiProviderStatus.ACTIVE)
                .orElse(null);
        if (hasText(systemApiKey)) {
            return new ResolvedAiProvider(
                    GEMINI,
                    systemProvider == null ? "Google Gemini" : systemProvider.getProviderName(),
                    systemApiKey.trim(),
                    modelOf(systemProvider),
                    AiProviderSource.SYSTEM_DEFAULT
            );
        }

        throw new CustomException(
                503,
                "Chưa cấu hình AI provider khả dụng. Hãy cấu hình GEMINI_API_KEY hoặc API key riêng hợp lệ."
        );
    }

    private ResolvedAiProvider toResolved(
            AiProviderEntity provider,
            String apiKey,
            AiProviderSource source
    ) {
        return new ResolvedAiProvider(
                provider.getProviderCode().toUpperCase(Locale.ROOT),
                provider.getProviderName(),
                apiKey.trim(),
                modelOf(provider),
                source
        );
    }

    private String modelOf(AiProviderEntity provider) {
        return provider != null && hasText(provider.getModelName())
                ? provider.getModelName().trim()
                : defaultModel.trim();
    }

    private boolean hasText(String value) {
        return value != null && !value.isBlank();
    }
}
