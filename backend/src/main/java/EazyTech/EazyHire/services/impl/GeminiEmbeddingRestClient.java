package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.services.AiEmbeddingClient;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
@Slf4j
public class GeminiEmbeddingRestClient implements AiEmbeddingClient {

    private final ObjectMapper objectMapper;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    @Value("${ai.request-timeout-seconds:30}")
    private long timeoutSeconds;

    @Value("${ai.retry-max-attempts:2}")
    private int maxAttempts;

    @Value("${ai.retry-backoff-millis:800}")
    private long retryBackoffMillis;

    @Value("${ai.matching.batch-size:32}")
    private int configuredBatchSize;

    @Override
    public List<List<Double>> embed(ResolvedAiProvider provider, String model, List<String> texts) {
        if (provider == null || provider.apiKey() == null || provider.apiKey().isBlank()) {
            throw new CustomException(503, "AI provider chưa có API key hợp lệ để tạo embedding");
        }
        if (!"GEMINI".equalsIgnoreCase(provider.providerCode())) {
            throw new CustomException(503, "AI provider hiện tại chưa hỗ trợ tạo embedding cho AI Match");
        }
        if (texts == null || texts.isEmpty()) return List.of();

        String normalizedModel = normalizeModel(model);
        int batchSize = Math.min(100, Math.max(1, configuredBatchSize));
        List<List<Double>> embeddings = new ArrayList<>(texts.size());
        for (int offset = 0; offset < texts.size(); offset += batchSize) {
            int end = Math.min(texts.size(), offset + batchSize);
            embeddings.addAll(embedBatch(provider, normalizedModel, texts.subList(offset, end)));
        }
        return embeddings;
    }

    private List<List<Double>> embedBatch(ResolvedAiProvider provider, String model, List<String> texts) {
        List<Map<String, Object>> requests = texts.stream()
                .map(text -> Map.<String, Object>of(
                        "model", "models/" + model,
                        "content", Map.of("parts", List.of(Map.of("text", text))),
                        "taskType", "SEMANTIC_SIMILARITY"
                ))
                .toList();
        String body;
        try {
            body = objectMapper.writeValueAsString(Map.of("requests", requests));
        } catch (JsonProcessingException exception) {
            throw new CustomException(503, "Không thể chuẩn bị dữ liệu embedding cho AI Match", exception);
        }

        int attempts = Math.max(1, maxAttempts);
        EmbeddingFailure lastFailure = null;
        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                return send(provider, model, body, texts.size());
            } catch (EmbeddingFailure failure) {
                lastFailure = failure;
                log.warn("Gemini embedding request failed: model={}, batchSize={}, attempt={}/{}, status={}, retryable={}",
                        model, texts.size(), attempt, attempts, failure.statusCode(), failure.retryable());
                if (!failure.retryable() || attempt == attempts) break;
                waitBeforeRetry(attempt);
            }
        }

        if (lastFailure == null) {
            throw new CustomException(503, "Gemini không trả về embedding cho AI Match");
        }
        throw new CustomException(503, lastFailure.userMessage(), lastFailure);
    }

    private List<List<Double>> send(ResolvedAiProvider provider, String model, String body, int expectedCount)
            throws EmbeddingFailure {
        URI endpoint;
        try {
            endpoint = URI.create(baseUrl.replaceAll("/+$", "") + "/models/" + model + ":batchEmbedContents");
        } catch (RuntimeException exception) {
            throw new EmbeddingFailure("GEMINI_BASE_URL hoặc AI_MATCHING_EMBEDDING_MODEL không hợp lệ", false, null, exception);
        }

        long requestTimeout = Math.max(1, timeoutSeconds);
        HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(requestTimeout))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", provider.apiKey())
                .POST(HttpRequest.BodyPublishers.ofString(body, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response;
        try {
            response = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(requestTimeout))
                    .build()
                    .send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new EmbeddingFailure("Yêu cầu Gemini embedding bị gián đoạn", false, null, exception);
        } catch (IOException exception) {
            throw new EmbeddingFailure("Không thể kết nối Gemini để tạo embedding", true, null, exception);
        }

        int status = response.statusCode();
        if (status < 200 || status >= 300) {
            if (status == 401 || status == 403) {
                throw new EmbeddingFailure("Gemini API key không hợp lệ hoặc chưa được cấp quyền tạo embedding", false, status, null);
            }
            if (status == 404) {
                throw new EmbeddingFailure("Không tìm thấy model embedding. Kiểm tra AI_MATCHING_EMBEDDING_MODEL", false, status, null);
            }
            boolean retryable = status == 429 || status >= 500;
            String message = status == 429
                    ? "Gemini đang giới hạn số request embedding; đã hết số lần thử tự động"
                    : status >= 500
                    ? "Gemini embedding tạm thời không khả dụng; đã hết số lần thử tự động"
                    : "Gemini từ chối request embedding (HTTP " + status + "); kiểm tra model và cấu hình AI Match";
            throw new EmbeddingFailure(message, retryable, status, null);
        }

        try {
            JsonNode root = objectMapper.readTree(response.body());
            JsonNode values = root.path("embeddings");
            if (!values.isArray() || values.size() != expectedCount) {
                throw new EmbeddingFailure("Gemini trả về số lượng embedding không khớp với ứng viên", true, status, null);
            }
            List<List<Double>> result = new ArrayList<>(values.size());
            for (JsonNode item : values) {
                JsonNode vector = item.path("values");
                if (!vector.isArray() || vector.isEmpty()) {
                    throw new EmbeddingFailure("Gemini trả về vector embedding rỗng", true, status, null);
                }
                List<Double> components = new ArrayList<>(vector.size());
                for (JsonNode component : vector) {
                    if (!component.isNumber()) {
                        throw new EmbeddingFailure("Gemini trả về vector embedding không hợp lệ", true, status, null);
                    }
                    components.add(component.doubleValue());
                }
                result.add(List.copyOf(components));
            }
            return List.copyOf(result);
        } catch (IOException exception) {
            throw new EmbeddingFailure("Gemini trả về JSON embedding không hợp lệ", true, status, exception);
        }
    }

    private String normalizeModel(String model) {
        if (model == null || !model.matches("[A-Za-z0-9._-]+")) {
            throw new CustomException(503, "AI_MATCHING_EMBEDDING_MODEL không hợp lệ");
        }
        return model;
    }

    private void waitBeforeRetry(int attempt) {
        long baseDelay = Math.max(0, retryBackoffMillis);
        if (baseDelay == 0) return;
        long multiplier = 1L << Math.min(Math.max(0, attempt - 1), 5);
        long delay = Math.min(baseDelay * multiplier, 10_000L);
        long jitter = ThreadLocalRandom.current().nextLong(Math.max(1L, delay / 4L + 1L));
        try {
            Thread.sleep(delay + jitter);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new CustomException(503, "Yêu cầu Gemini embedding bị gián đoạn trong lúc retry", exception);
        }
    }

    private static final class EmbeddingFailure extends Exception {
        private final boolean retryable;
        private final Integer statusCode;
        private final String userMessage;

        private EmbeddingFailure(String userMessage, boolean retryable, Integer statusCode, Throwable cause) {
            super(userMessage, cause);
            this.userMessage = userMessage;
            this.retryable = retryable;
            this.statusCode = statusCode;
        }

        private boolean retryable() {
            return retryable;
        }

        private Integer statusCode() {
            return statusCode;
        }

        private String userMessage() {
            return userMessage;
        }
    }
}
