package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.enums.AiProviderSource;

public record ResolvedAiProvider(
        String providerCode,
        String providerName,
        String apiKey,
        String model,
        AiProviderSource source
) {
}
