package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.services.AiTextGenerationClient;
import EazyTech.EazyHire.services.AiGenerationResult;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

@Component
@RequiredArgsConstructor
public class GeminiRestClient implements AiTextGenerationClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiRestClient.class);

    private final ObjectMapper objectMapper;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    @Value("${ai.request-timeout-seconds:30}")
    private long requestTimeoutSeconds;

    /**
     * Number of attempts per model, including the initial request.
     * A value of 2 means one retry after the first failed request.
     */
    @Value("${ai.retry-max-attempts:2}")
    private int retryMaxAttempts;

    @Value("${ai.retry-backoff-millis:800}")
    private long retryBackoffMillis;

    @Value("${gemini.fallback-model:gemini-3.5-flash-lite}")
    private String fallbackModel;

    @Override
    public String generateJson(
            ResolvedAiProvider provider,
            String prompt,
            Map<String, Object> responseSchema
    ) {
        return generateJsonWithMetadata(provider, prompt, responseSchema).content();
    }

    @Override
    public AiGenerationResult generateJsonWithMetadata(
            ResolvedAiProvider provider,
            String prompt,
            Map<String, Object> responseSchema
    ) {
        if (provider == null || provider.apiKey() == null || provider.apiKey().isBlank()) {
            throw new CustomException(503, "AI provider chưa có API key hợp lệ");
        }
        if (!"GEMINI".equalsIgnoreCase(provider.providerCode())) {
            throw new CustomException(503, "AI provider hiện tại chưa được hỗ trợ");
        }

        String primaryModel = normalizeModel(provider.model());
        if (primaryModel == null) {
            throw new CustomException(503, "Gemini chưa được cấu hình model khả dụng");
        }

        Set<String> configuredModels = new LinkedHashSet<>();
        configuredModels.add(primaryModel);
        String configuredFallbackModel = normalizeModel(fallbackModel);
        if (configuredFallbackModel != null && !configuredFallbackModel.equalsIgnoreCase(primaryModel)) {
            configuredModels.add(configuredFallbackModel);
        }

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(Map.of(
                        "parts", List.of(Map.of("text", prompt))
                )),
                "generationConfig", Map.of(
                        "temperature", 0.2,
                        "responseMimeType", "application/json",
                        "responseSchema", responseSchema
                )
        );

        GeminiCallFailure lastFailure = null;
        List<String> models = new ArrayList<>(configuredModels);
        for (int modelIndex = 0; modelIndex < models.size(); modelIndex++) {
            String model = models.get(modelIndex);
            ResolvedAiProvider modelProvider = withModel(provider, model);
            try {
                return new AiGenerationResult(
                        generateWithRetries(modelProvider, requestBody),
                        model
                );
            } catch (GeminiCallFailure failure) {
                lastFailure = failure;
                boolean hasFallback = modelIndex < models.size() - 1;
                if (!hasFallback || !failure.fallbackEligible()) {
                    break;
                }
                log.warn(
                        "Gemini primary model unavailable; switching to fallback: primaryModel={}, fallbackModel={}, reason={}",
                        model,
                        models.get(modelIndex + 1),
                        failure.userMessage()
                );
            }
        }

        throw toCustomException(lastFailure, models);
    }

    private String generateWithRetries(
            ResolvedAiProvider provider,
            Map<String, Object> requestBody
    ) throws GeminiCallFailure {
        int attempts = Math.max(1, retryMaxAttempts);
        GeminiCallFailure lastFailure = null;
        for (int attempt = 1; attempt <= attempts; attempt++) {
            try {
                return requestModel(provider, requestBody);
            } catch (GeminiCallFailure failure) {
                lastFailure = failure;
                log.warn(
                        "Gemini generateContent attempt failed: provider={}, model={}, attempt={}/{}, retryable={}, status={}, reason={}",
                        provider.providerCode(),
                        provider.model(),
                        attempt,
                        attempts,
                        failure.retryable(),
                        failure.statusCode(),
                        failure.userMessage()
                );
                if (!failure.retryable() || attempt == attempts) {
                    throw failure;
                }
                waitBeforeRetry(attempt);
            }
        }
        throw lastFailure == null
                ? new GeminiCallFailure("Gemini không trả về kết quả", false, false, null, null)
                : lastFailure;
    }

    private String requestModel(
            ResolvedAiProvider provider,
            Map<String, Object> requestBody
    ) throws GeminiCallFailure {
        String model = normalizeModel(provider.model());
        URI endpoint;
        try {
            endpoint = URI.create(baseUrl.replaceAll("/+$", "") + "/models/" + model + ":generateContent");
        } catch (RuntimeException exception) {
            throw new GeminiCallFailure(
                    "Gemini có endpoint không hợp lệ. Vui lòng kiểm tra GEMINI_BASE_URL",
                    false,
                    false,
                    null,
                    exception
            );
        }

        String payload;
        try {
            payload = objectMapper.writeValueAsString(requestBody);
        } catch (JsonProcessingException exception) {
            throw new GeminiCallFailure(
                    "Không thể chuẩn bị request tới Gemini",
                    false,
                    false,
                    null,
                    exception
            );
        }

        long timeoutSeconds = Math.max(1, requestTimeoutSeconds);
        HttpRequest request = HttpRequest.newBuilder(endpoint)
                .timeout(Duration.ofSeconds(timeoutSeconds))
                .header("Content-Type", "application/json")
                .header("x-goog-api-key", provider.apiKey())
                .POST(HttpRequest.BodyPublishers.ofString(payload, StandardCharsets.UTF_8))
                .build();

        HttpResponse<String> response;
        try {
            response = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(timeoutSeconds))
                    .build()
                    .send(request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new GeminiCallFailure(
                    "Request tới Gemini bị gián đoạn. Vui lòng thử lại",
                    false,
                    false,
                    null,
                    exception
            );
        } catch (IOException exception) {
            throw new GeminiCallFailure(
                    "Không thể kết nối tới Gemini. Vui lòng thử lại sau",
                    true,
                    true,
                    null,
                    exception
            );
        }

        int status = response.statusCode();
        if (status >= 200 && status < 300) {
            try {
                return extractText(response.body());
            } catch (CustomException exception) {
                throw new GeminiCallFailure(exception.getMessage(), true, true, status, exception);
            } catch (IOException exception) {
                throw new GeminiCallFailure(
                        "Gemini trả về nội dung không hợp lệ. Vui lòng thử lại",
                        true,
                        true,
                        status,
                        exception
                );
            }
        }

        String detail = summarize(response.body());
        log.warn(
                "Gemini generateContent failed: provider={}, model={}, status={}, detail={}",
                provider.providerCode(),
                model,
                status,
                detail
        );

        if (status == 401 || status == 403) {
            throw new GeminiCallFailure(
                    "Gemini API key không hợp lệ hoặc chưa được cấp quyền",
                    false,
                    false,
                    status,
                    null
            );
        }
        if (status == 404) {
            throw new GeminiCallFailure(
                    "Gemini không tìm thấy model " + model,
                    false,
                    true,
                    status,
                    null
            );
        }
        if (isTransientStatus(status)) {
            String message = status == 429
                    ? "Gemini đang giới hạn số request"
                    : "Dịch vụ Gemini tạm thời không khả dụng";
            throw new GeminiCallFailure(message + ". Vui lòng thử lại sau", true, true, status, null);
        }

        throw new GeminiCallFailure(
                "Gemini từ chối request (HTTP " + status + "). Vui lòng kiểm tra model và request schema",
                false,
                false,
                status,
                null
        );
    }

    private void waitBeforeRetry(int attempt) throws GeminiCallFailure {
        long baseDelay = Math.max(0, retryBackoffMillis);
        if (baseDelay == 0) return;

        long multiplier = 1L << Math.min(Math.max(0, attempt - 1), 5);
        long delay = Math.min(baseDelay * multiplier, 10_000L);
        long jitter = ThreadLocalRandom.current().nextLong(Math.max(1L, delay / 4L + 1L));
        try {
            Thread.sleep(delay + jitter);
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new GeminiCallFailure(
                    "Request tới Gemini bị gián đoạn trong lúc retry",
                    false,
                    false,
                    null,
                    exception
            );
        }
    }

    private CustomException toCustomException(GeminiCallFailure failure, List<String> models) {
        if (failure == null) {
            return new CustomException(503, "Không thể hoàn tất yêu cầu AI. Vui lòng thử lại sau");
        }
        if (!failure.fallbackEligible()) {
            return new CustomException(503, failure.userMessage(), failure);
        }

        int attempts = Math.max(1, retryMaxAttempts);
        String modelSummary = models.size() > 1
                ? "model chính '" + models.get(0) + "' và model dự phòng '" + models.get(1) + "'"
                : "model '" + models.get(0) + "'";
        String message = models.size() > 1
                ? "Không thể hoàn tất yêu cầu AI: " + modelSummary
                + " đều không khả dụng sau tối đa " + attempts
                + " lần thử mỗi model. Vui lòng thử lại sau hoặc đánh giá thủ công."
                : "Không thể hoàn tất yêu cầu AI với " + modelSummary
                + " sau tối đa " + attempts
                + " lần thử. Vui lòng thử lại sau hoặc đánh giá thủ công.";
        return new CustomException(503, message, failure);
    }

    private ResolvedAiProvider withModel(ResolvedAiProvider provider, String model) {
        return new ResolvedAiProvider(
                provider.providerCode(),
                provider.providerName(),
                provider.apiKey(),
                model,
                provider.source()
        );
    }

    private String normalizeModel(String model) {
        if (model == null || model.isBlank()) return null;
        return model.trim().replaceFirst("^models/", "");
    }

    private boolean isTransientStatus(int status) {
        return status == 408 || status == 429 || status == 500 || status == 502 || status == 503 || status == 504;
    }

    private String extractText(String rawResponse) throws IOException {
        JsonNode root = objectMapper.readTree(rawResponse);
        JsonNode candidates = root.path("candidates");
        if (!candidates.isArray() || candidates.isEmpty()) {
            throw new CustomException(503, "Gemini không trả về kết quả hợp lệ");
        }

        StringBuilder text = new StringBuilder();
        for (JsonNode part : candidates.get(0).path("content").path("parts")) {
            JsonNode textNode = part.get("text");
            if (textNode != null && textNode.isTextual()) text.append(textNode.asText());
        }
        if (text.isEmpty()) {
            throw new CustomException(503, "Gemini không trả về nội dung phân tích");
        }
        return text.toString().trim();
    }

    private String summarize(String body) {
        if (body == null || body.isBlank()) return "empty response";
        String normalized = body.replaceAll("\\s+", " ").trim();
        return normalized.length() <= 500 ? normalized : normalized.substring(0, 500);
    }

    private static final class GeminiCallFailure extends Exception {

        private final String userMessage;
        private final boolean retryable;
        private final boolean fallbackEligible;
        private final Integer statusCode;

        private GeminiCallFailure(
                String userMessage,
                boolean retryable,
                boolean fallbackEligible,
                Integer statusCode,
                Throwable cause
        ) {
            super(userMessage, cause);
            this.userMessage = userMessage;
            this.retryable = retryable;
            this.fallbackEligible = fallbackEligible;
            this.statusCode = statusCode;
        }

        private String userMessage() {
            return userMessage;
        }

        private boolean retryable() {
            return retryable;
        }

        private boolean fallbackEligible() {
            return fallbackEligible;
        }

        private Integer statusCode() {
            return statusCode;
        }
    }
}
