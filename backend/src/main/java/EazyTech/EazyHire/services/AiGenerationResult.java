package EazyTech.EazyHire.services;

/**
 * AI content together with the model that actually produced it.
 * This is important when the client has to switch to a fallback model.
 */
public record AiGenerationResult(
        String content,
        String model
) {
}
