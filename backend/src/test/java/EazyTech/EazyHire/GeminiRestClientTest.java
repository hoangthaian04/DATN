package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.enums.AiProviderSource;
import EazyTech.EazyHire.services.AiGenerationResult;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import EazyTech.EazyHire.services.impl.GeminiRestClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GeminiRestClientTest {

    private static final String SUCCESS_RESPONSE = """
            {
              "candidates": [
                {
                  "content": {
                    "parts": [
                      {"text": "{\\"result\\":\\"ok\\"}"}
                    ]
                  }
                }
              ]
            }
            """;

    private HttpServer server;
    private GeminiRestClient client;
    private AtomicInteger primaryRequests;
    private AtomicInteger fallbackRequests;
    private boolean alwaysFail;
    private boolean primaryAlwaysFail;

    @BeforeEach
    void setUp() throws IOException {
        primaryRequests = new AtomicInteger();
        fallbackRequests = new AtomicInteger();
        alwaysFail = false;
        primaryAlwaysFail = false;
        server = HttpServer.create(new InetSocketAddress("localhost", 0), 0);
        server.createContext("/", this::handleRequest);
        server.start();

        client = new GeminiRestClient(new ObjectMapper());
        ReflectionTestUtils.setField(client, "baseUrl", "http://localhost:" + server.getAddress().getPort());
        ReflectionTestUtils.setField(client, "requestTimeoutSeconds", 2L);
        ReflectionTestUtils.setField(client, "retryMaxAttempts", 2);
        ReflectionTestUtils.setField(client, "retryBackoffMillis", 0L);
        ReflectionTestUtils.setField(client, "fallbackModel", "fallback-model");
    }

    @AfterEach
    void tearDown() {
        if (server != null) server.stop(0);
    }

    @Test
    void retriesPrimaryModelBeforeReturningSuccessfulResponse() {
        AiGenerationResult result = client.generateJsonWithMetadata(provider(), "prompt", Map.of());

        assertEquals("{\"result\":\"ok\"}", result.content());
        assertEquals("primary-model", result.model());
        assertEquals(2, primaryRequests.get());
        assertEquals(0, fallbackRequests.get());
    }

    @Test
    void retriesPrimaryThenSwitchesToFallbackModel() {
        primaryAlwaysFail = true;

        AiGenerationResult result = client.generateJsonWithMetadata(provider(), "prompt", Map.of());

        assertEquals("{\"result\":\"ok\"}", result.content());
        assertEquals("fallback-model", result.model());
        assertEquals(2, primaryRequests.get());
        assertEquals(1, fallbackRequests.get());
    }

    @Test
    void returnsClearErrorWhenPrimaryAndFallbackBothExhaustRetries() {
        alwaysFail = true;

        CustomException exception = assertThrows(
                CustomException.class,
                () -> client.generateJson(provider(), "prompt", Map.of())
        );

        assertEquals(503, exception.getStatusCode());
        assertTrue(exception.getMessage().contains("primary-model"));
        assertTrue(exception.getMessage().contains("fallback-model"));
        assertTrue(exception.getMessage().contains("2 lần thử mỗi model"));
        assertTrue(exception.getMessage().contains("đánh giá thủ công"));
        assertEquals(2, primaryRequests.get());
        assertEquals(2, fallbackRequests.get());
    }

    private ResolvedAiProvider provider() {
        return new ResolvedAiProvider(
                "GEMINI",
                "Google Gemini",
                "test-key",
                "primary-model",
                AiProviderSource.SYSTEM_DEFAULT
        );
    }

    private void handleRequest(HttpExchange exchange) throws IOException {
        String path = exchange.getRequestURI().getPath();
        boolean isFallback = path.contains("fallback-model");
        int requestCount = isFallback
                ? fallbackRequests.incrementAndGet()
                : primaryRequests.incrementAndGet();
        boolean shouldFail = alwaysFail || (!isFallback && (primaryAlwaysFail || requestCount == 1));
        byte[] body = (shouldFail ? "{\"error\":{\"status\":\"UNAVAILABLE\"}}" : SUCCESS_RESPONSE)
                .getBytes(StandardCharsets.UTF_8);
        exchange.sendResponseHeaders(shouldFail ? 503 : 200, body.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(body);
        }
    }
}
