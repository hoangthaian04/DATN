package EazyTech.EazyHire.services;

import java.util.List;

public interface AiEmbeddingClient {
    List<List<Double>> embed(ResolvedAiProvider provider, String model, List<String> texts);
}
