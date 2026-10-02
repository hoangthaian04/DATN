package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.CvAnalysisRequestDTO;
import EazyTech.EazyHire.models.dtos.CvAnalysisResponseDTO;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.models.entities.CvAnalysisEntity;
import EazyTech.EazyHire.models.enums.CvAnalysisStatus;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.CvAnalysisRepository;
import EazyTech.EazyHire.services.AiProviderResolver;
import EazyTech.EazyHire.services.AiGenerationResult;
import EazyTech.EazyHire.services.AiTextGenerationClient;
import EazyTech.EazyHire.services.CvAnalysisService;
import EazyTech.EazyHire.services.CvStorageService;
import EazyTech.EazyHire.services.CvTextExtractor;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CvAnalysisServiceImpl implements CvAnalysisService {

    private final ApplicationRepository applicationRepository;
    private final CvAnalysisRepository cvAnalysisRepository;
    private final CvAnalysisFailurePersistenceService failurePersistenceService;
    private final CvStorageService cvStorageService;
    private final CvTextExtractor cvTextExtractor;
    private final AiProviderResolver aiProviderResolver;
    private final AiTextGenerationClient aiTextGenerationClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.max-input-chars:40000}")
    private int maxInputChars;

    @Override
    @Transactional
    public CvAnalysisResponseDTO analyze(
            Long applicationId,
            Long companyId,
            CvAnalysisRequestDTO request
    ) {
        if (companyId == null) {
            throw new CustomException(403, "Tài khoản chưa thuộc workspace tuyển dụng hợp lệ");
        }
        ApplicationEntity application = applicationRepository
                .findByIdAndCompanyIdWithContext(applicationId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy hồ sơ trong workspace hiện tại"));
        ensureCvScoringEligible(application);

        boolean rerun = request != null && Boolean.TRUE.equals(request.getRerun());
        if (!rerun) {
            CvAnalysisEntity latestSuccess = cvAnalysisRepository
                    .findFirstByApplicationIdAndCompanyIdAndStatusOrderByCreatedAtDesc(
                            applicationId, companyId, CvAnalysisStatus.COMPLETED
                    )
                    .orElse(null);
            if (latestSuccess != null) return toResponse(latestSuccess);
        }

        ResolvedAiProvider provider = null;
        try {
            provider = aiProviderResolver.resolve(companyId);
            if (application.getCvUrl() == null || application.getCvUrl().isBlank()) {
                throw new CustomException(422, "Hồ sơ chưa có CV để phân tích");
            }
            String cvText = cvTextExtractor.extract(cvStorageService.read(application.getCvUrl()));
            String prompt = buildPrompt(application, cvText);
            AiGenerationResult generated = aiTextGenerationClient.generateJsonWithMetadata(provider, prompt, scoreSchema());
            JsonNode result = parseObject(generated.content());
            CvAnalysisEntity analysis = buildAnalysis(application, provider, generated.model(), result);
            return toResponse(cvAnalysisRepository.save(analysis));
        } catch (CustomException exception) {
            failurePersistenceService.saveFailure(application, provider, exception.getMessage());
            throw exception;
        } catch (Exception exception) {
            failurePersistenceService.saveFailure(
                    application,
                    provider,
                    "Không thể hoàn tất phân tích CV. Vui lòng thử lại sau"
            );
            throw new CustomException(503, "Không thể hoàn tất phân tích CV. Vui lòng thử lại sau", exception);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<CvAnalysisResponseDTO> getLatest(Long applicationId, Long companyId) {
        if (companyId == null) {
            throw new CustomException(403, "Tài khoản chưa thuộc workspace tuyển dụng hợp lệ");
        }
        ApplicationEntity application = applicationRepository.findByIdAndCompanyIdWithContext(applicationId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy hồ sơ trong workspace hiện tại"));
        ensureCvScoringEligible(application);
        return cvAnalysisRepository
                .findFirstByApplicationIdAndCompanyIdAndStatusOrderByCreatedAtDesc(
                        applicationId, companyId, CvAnalysisStatus.COMPLETED
                )
                .map(this::toResponse);
    }

    private void ensureCvScoringEligible(ApplicationEntity application) {
        if (application.getJob() == null || !Boolean.TRUE.equals(application.getJob().getRequiresCv())) {
            throw new CustomException(422, "Job này không yêu cầu CV nên không thể chấm điểm AI");
        }
    }

    private String buildPrompt(ApplicationEntity application, String cvText) {
        var job = application.getJob();
        String safeCvText = truncate(cvText);
        return """
                Bạn là chuyên gia hỗ trợ screening tuyển dụng. Hãy so sánh CV với JD dưới đây.
                Chỉ trả về JSON đúng schema đã yêu cầu, không thêm markdown fence và không giải thích bên ngoài JSON.
                Chỉ đánh giá kỹ năng cứng, kinh nghiệm và mức độ khớp với yêu cầu công việc.
                Không suy đoán hoặc đánh giá giới tính, tuổi, dân tộc, tôn giáo, tình trạng hôn nhân hay đặc điểm nhạy cảm.
                Không tự động kết luận tuyển dụng, không trả về quyết định reject/hire.

                JOB TITLE:
                %s

                JOB DESCRIPTION:
                %s

                JOB REQUIREMENTS:
                %s

                JOB BENEFITS:
                %s

                CV TEXT:
                %s
                """.formatted(
                valueOrFallback(job.getTitle()),
                valueOrFallback(job.getDescription()),
                valueOrFallback(job.getRequirements()),
                valueOrFallback(job.getBenefits()),
                safeCvText
        );
    }

    private CvAnalysisEntity buildAnalysis(
            ApplicationEntity application,
            ResolvedAiProvider provider,
            String model,
            JsonNode result
    ) {
        BigDecimal score = requiredScore(result).setScale(2, RoundingMode.HALF_UP);
        return CvAnalysisEntity.builder()
                .companyId(application.getCompany().getId())
                .applicationId(application.getId())
                .jobId(application.getJob().getId())
                .matchingScore(score)
                .matchedSkills(readStringList(result, "matchedSkills"))
                .missingSkills(readStringList(result, "missingSkills"))
                .strengths(readStringList(result, "strengths"))
                .weaknesses(readStringList(result, "weaknesses"))
                .summary(requiredText(result, "summary"))
                .providerCode(provider.providerCode())
                .providerSource(provider.source())
                .modelName(model)
                .status(CvAnalysisStatus.COMPLETED)
                .build();
    }

    private Map<String, Object> scoreSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("matchingScore", Map.of("type", "NUMBER"));
        properties.put("matchedSkills", Map.of("type", "ARRAY", "items", Map.of("type", "STRING")));
        properties.put("missingSkills", Map.of("type", "ARRAY", "items", Map.of("type", "STRING")));
        properties.put("strengths", Map.of("type", "ARRAY", "items", Map.of("type", "STRING")));
        properties.put("weaknesses", Map.of("type", "ARRAY", "items", Map.of("type", "STRING")));
        properties.put("summary", Map.of("type", "STRING"));
        return Map.of(
                "type", "OBJECT",
                "properties", properties,
                "required", List.of("matchingScore", "matchedSkills", "missingSkills", "strengths", "weaknesses", "summary"),
                "propertyOrdering", List.of("matchingScore", "matchedSkills", "missingSkills", "strengths", "weaknesses", "summary")
        );
    }

    private JsonNode parseObject(String rawResponse) {
        try {
            JsonNode node = objectMapper.readTree(rawResponse);
            if (node == null || !node.isObject()) {
                throw new CustomException(503, "AI trả về kết quả CV không hợp lệ");
            }
            return node;
        } catch (JsonProcessingException exception) {
            throw new CustomException(503, "AI trả về kết quả CV không hợp lệ", exception);
        }
    }

    private BigDecimal requiredScore(JsonNode result) {
        JsonNode scoreNode = result.get("matchingScore");
        if (scoreNode == null || !scoreNode.isNumber()) {
            throw new CustomException(503, "AI trả về matchingScore không hợp lệ");
        }
        BigDecimal score = scoreNode.decimalValue();
        if (score.compareTo(BigDecimal.ZERO) < 0 || score.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new CustomException(503, "AI trả về matchingScore ngoài khoảng 0-100");
        }
        return score;
    }

    private String requiredText(JsonNode result, String field) {
        JsonNode value = result.get(field);
        if (value == null || !value.isTextual() || value.asText().isBlank()) {
            throw new CustomException(503, "AI trả về kết quả CV thiếu trường " + field);
        }
        return value.asText().trim();
    }

    private List<String> readStringList(JsonNode result, String field) {
        JsonNode values = result.get(field);
        if (values == null || !values.isArray()) {
            throw new CustomException(503, "AI trả về danh sách " + field + " không hợp lệ");
        }
        List<String> resultList = new ArrayList<>();
        for (JsonNode value : values) {
            if (value.isTextual() && !value.asText().isBlank()) resultList.add(value.asText().trim());
        }
        return resultList;
    }

    private CvAnalysisResponseDTO toResponse(CvAnalysisEntity entity) {
        return CvAnalysisResponseDTO.builder()
                .id(entity.getId())
                .applicationId(entity.getApplicationId())
                .matchingScore(entity.getMatchingScore())
                .matchedSkills(entity.getMatchedSkills())
                .missingSkills(entity.getMissingSkills())
                .strengths(entity.getStrengths())
                .weaknesses(entity.getWeaknesses())
                .summary(entity.getSummary())
                .provider(entity.getProviderCode())
                .providerSource(entity.getProviderSource())
                .status(entity.getStatus())
                .build();
    }

    private String truncate(String value) {
        int limit = Math.max(1000, maxInputChars);
        return value.length() <= limit
                ? value
                : value.substring(0, limit) + "\n[CV đã được rút gọn để phù hợp giới hạn xử lý]";
    }

    private String valueOrFallback(String value) {
        return value == null || value.isBlank() ? "Không cung cấp" : value.trim();
    }
}
