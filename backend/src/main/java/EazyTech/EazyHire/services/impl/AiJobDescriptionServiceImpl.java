package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.JobDescriptionSuggestionRequestDTO;
import EazyTech.EazyHire.models.dtos.JobDescriptionSuggestionResponseDTO;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import EazyTech.EazyHire.repositories.JobCategoryRepository;
import EazyTech.EazyHire.services.AiJobDescriptionService;
import EazyTech.EazyHire.services.AiGenerationResult;
import EazyTech.EazyHire.services.AiProviderResolver;
import EazyTech.EazyHire.services.AiTextGenerationClient;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class AiJobDescriptionServiceImpl implements AiJobDescriptionService {

    private static final Set<String> EXPERIENCE_LEVELS = Set.of("INTERN", "JUNIOR", "MID", "SENIOR", "LEAD");
    private static final Set<String> WORKING_TYPES = Set.of("ONSITE", "REMOTE", "HYBRID");

    private final JobCategoryRepository jobCategoryRepository;
    private final AiProviderResolver aiProviderResolver;
    private final AiTextGenerationClient aiTextGenerationClient;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public JobDescriptionSuggestionResponseDTO suggest(
            JobDescriptionSuggestionRequestDTO request,
            Long companyId
    ) {
        if (companyId == null) {
            throw new CustomException(403, "Tài khoản chưa thuộc workspace tuyển dụng hợp lệ");
        }

        JobCategoryEntity category = jobCategoryRepository
                .findByIdAndStatusAndIsDeletedFalse(request.getCategoryId(), JobCategoryStatus.ACTIVE)
                .orElseThrow(() -> new CustomException(400, "Danh mục không tồn tại hoặc không còn ACTIVE"));

        String experienceLevel = normalizeOptional(request.getExperienceLevel());
        if (experienceLevel != null && !EXPERIENCE_LEVELS.contains(experienceLevel)) {
            throw new CustomException(400, "experienceLevel không hợp lệ");
        }
        String workingType = normalizeOptional(request.getWorkingType());
        if (workingType != null && !WORKING_TYPES.contains(workingType)) {
            throw new CustomException(400, "workingType không hợp lệ");
        }

        ResolvedAiProvider provider = aiProviderResolver.resolve(companyId);
        AiGenerationResult generated = aiTextGenerationClient.generateJsonWithMetadata(
                provider,
                buildPrompt(request, category, experienceLevel, workingType),
                suggestionSchema()
        );
        JsonNode result = parseObject(generated.content(), "Gemini trả về gợi ý JD không hợp lệ");

        return JobDescriptionSuggestionResponseDTO.builder()
                .suggestedDescription(requiredText(result, "suggestedDescription"))
                .suggestedRequirements(requiredText(result, "suggestedRequirements"))
                .suggestedBenefits(requiredText(result, "suggestedBenefits"))
                .provider(provider.providerCode())
                .providerSource(provider.source())
                .model(generated.model())
                .build();
    }

    private String buildPrompt(
            JobDescriptionSuggestionRequestDTO request,
            JobCategoryEntity category,
            String experienceLevel,
            String workingType
    ) {
        String extraPrompt = request.getPrompt() == null ? "" : request.getPrompt().trim();
        return """
                Bạn là chuyên gia tuyển dụng. Hãy viết một JD rõ ràng, thực tế và không phân biệt đối xử.
                Chỉ trả về JSON đúng schema đã yêu cầu, không thêm markdown fence, không giải thích bên ngoài JSON.
                Không tự quyết định tuyển dụng, không đưa thông tin lương nếu request không cung cấp.

                Tiêu đề: %s
                Danh mục: %s
                Cấp độ kinh nghiệm: %s
                Hình thức làm việc: %s
                Gợi ý bổ sung từ HR: %s

                Nội dung phải có:
                - suggestedDescription: trách nhiệm chính và mục tiêu của vị trí.
                - suggestedRequirements: kỹ năng, kinh nghiệm và tiêu chí cần thiết.
                - suggestedBenefits: quyền lợi hợp lý, không bịa chính sách cụ thể nếu HR chưa cung cấp.
                """.formatted(
                request.getTitle().trim(),
                category.getName(),
                experienceLevel == null ? "Không nêu" : experienceLevel,
                workingType == null ? "Không nêu" : workingType,
                extraPrompt.isBlank() ? "Không có" : extraPrompt
        );
    }

    private Map<String, Object> suggestionSchema() {
        Map<String, Object> properties = new LinkedHashMap<>();
        properties.put("suggestedDescription", Map.of("type", "STRING"));
        properties.put("suggestedRequirements", Map.of("type", "STRING"));
        properties.put("suggestedBenefits", Map.of("type", "STRING"));
        return Map.of(
                "type", "OBJECT",
                "properties", properties,
                "required", List.of("suggestedDescription", "suggestedRequirements", "suggestedBenefits"),
                "propertyOrdering", List.of("suggestedDescription", "suggestedRequirements", "suggestedBenefits")
        );
    }

    private JsonNode parseObject(String rawResponse, String message) {
        try {
            JsonNode node = objectMapper.readTree(rawResponse);
            if (node == null || !node.isObject()) {
                throw new CustomException(503, message);
            }
            return node;
        } catch (JsonProcessingException exception) {
            throw new CustomException(503, message, exception);
        }
    }

    private String requiredText(JsonNode node, String field) {
        JsonNode value = node.get(field);
        if (value == null || !value.isTextual() || value.asText().isBlank()) {
            throw new CustomException(503, "AI trả về gợi ý JD thiếu trường " + field);
        }
        return value.asText().trim();
    }

    private String normalizeOptional(String value) {
        return value == null || value.isBlank() ? null : value.trim().toUpperCase(Locale.ROOT);
    }
}
