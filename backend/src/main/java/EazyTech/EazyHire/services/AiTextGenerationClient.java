package EazyTech.EazyHire.services;

import java.util.Map;

public interface AiTextGenerationClient {

    String generateJson(ResolvedAiProvider provider, String prompt, Map<String, Object> responseSchema);

    default AiGenerationResult generateJsonWithMetadata(
            ResolvedAiProvider provider,
            String prompt,
            Map<String, Object> responseSchema
    ) {
        return new AiGenerationResult(
                generateJson(provider, prompt, responseSchema),
                provider == null ? null : provider.model()
        );
    }
}
