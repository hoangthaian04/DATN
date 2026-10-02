package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.entities.AiMatchingRunEntity;
import EazyTech.EazyHire.models.entities.AiSuggestionEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.enums.AiMatchingRunStatus;
import EazyTech.EazyHire.repositories.AiMatchingRunRepository;
import EazyTech.EazyHire.repositories.AiSuggestionRepository;
import EazyTech.EazyHire.repositories.AiMatchingCandidateProjection;
import EazyTech.EazyHire.repositories.CvAnalysisRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AiEmbeddingClient;
import EazyTech.EazyHire.services.AiMatchingRunQueueService;
import EazyTech.EazyHire.services.AiProviderResolver;
import EazyTech.EazyHire.services.ResolvedAiProvider;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AiMatchingProcessor {

    private static final String MATCH_REASON =
            "Điểm phản ánh độ tương đồng ngữ nghĩa giữa yêu cầu công việc và kỹ năng/kinh nghiệm đã phân tích từ CV.";

    private final AiMatchingRunRepository runRepository;
    private final AiSuggestionRepository suggestionRepository;
    private final CvAnalysisRepository cvAnalysisRepository;
    private final JobRepository jobRepository;
    private final AiMatchingRunQueueService queueService;
    private final AiProviderResolver aiProviderResolver;
    private final AiEmbeddingClient embeddingClient;
    private final ObjectMapper objectMapper;

    @Value("${ai.matching.embedding-model:gemini-embedding-001}")
    private String embeddingModel;

    @Value("${ai.matching.input-max-chars:8000}")
    private int maxInputChars;

    @Value("${ai.matching.batch-size:32}")
    private int configuredBatchSize;

    @Transactional
    public void process(Long runId) {
        AiMatchingRunEntity run = runRepository.findById(runId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy yêu cầu AI Match"));
        if (run.getStatus() != AiMatchingRunStatus.PROCESSING) return;

        JobEntity job = jobRepository.findByIdAndCompanyIdAndIsDeletedFalse(run.getJobId(), run.getCompanyId())
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy Job trong workspace hiện tại"));
        String jobText = jobText(job);
        List<AiMatchingCandidateProjection> candidates = cvAnalysisRepository
                .findEligibleCandidatesForMatching(run.getCompanyId(), run.getJobId());

        if (candidates.isEmpty()) {
            replaceSuggestions(run, List.of());
            complete(run, null, null);
            return;
        }

        ResolvedAiProvider provider = aiProviderResolver.resolve(run.getCompanyId());
        List<Double> jobEmbedding = embeddingClient.embed(provider, embeddingModel, List.of(jobText)).get(0);
        List<AiSuggestionEntity> matches = new ArrayList<>();
        int batchSize = Math.min(100, Math.max(1, configuredBatchSize));
        for (int offset = 0; offset < candidates.size(); offset += batchSize) {
            queueService.renewLease(runId);
            int end = Math.min(candidates.size(), offset + batchSize);
            List<AiMatchingCandidateProjection> batch = candidates.subList(offset, end);
            List<String> profileTexts = batch.stream().map(this::candidateText).toList();
            List<List<Double>> candidateEmbeddings = embeddingClient.embed(provider, embeddingModel, profileTexts);
            for (int index = 0; index < batch.size(); index++) {
                AiMatchingCandidateProjection candidate = batch.get(index);
                BigDecimal score = score(jobEmbedding, candidateEmbeddings.get(index));
                if (score.compareTo(run.getMinScore()) < 0) continue;
                List<String> skills = readStringList(candidate.getMatchedSkillsJson());
                List<String> matchedSkills = skills.stream()
                        .filter(skill -> appearsAsTerm(jobText, skill))
                        .distinct()
                        .limit(12)
                        .toList();
                matches.add(AiSuggestionEntity.builder()
                        .companyId(run.getCompanyId())
                        .jobId(run.getJobId())
                        .candidateId(candidate.getCandidateId())
                        .sourceApplicationId(candidate.getSourceApplicationId())
                        .runId(run.getId())
                        .matchingScore(score)
                        .matchedSkills(matchedSkills)
                        .strengths(readStringList(candidate.getStrengthsJson()).stream().limit(4).toList())
                        .reason(MATCH_REASON)
                        .recentApplicationAt(candidate.getRecentApplicationAt())
                        .build());
            }
        }

        matches.sort((left, right) -> right.getMatchingScore().compareTo(left.getMatchingScore()));
        List<AiSuggestionEntity> topMatches = matches.stream().limit(run.getResultLimit()).toList();
        replaceSuggestions(run, topMatches);
        complete(run, provider, embeddingModel);
    }

    private void replaceSuggestions(AiMatchingRunEntity run, List<AiSuggestionEntity> suggestions) {
        suggestionRepository.deleteByJobIdAndCompanyId(run.getJobId(), run.getCompanyId());
        if (!suggestions.isEmpty()) suggestionRepository.saveAll(suggestions);
    }

    private void complete(AiMatchingRunEntity run, ResolvedAiProvider provider, String model) {
        run.setStatus(AiMatchingRunStatus.COMPLETED);
        run.setErrorMessage(null);
        run.setLeaseUntil(null);
        run.setCompletedAt(java.time.LocalDateTime.now());
        if (provider != null) {
            run.setProviderCode(provider.providerCode());
            run.setProviderSource(provider.source());
        }
        run.setModelName(model);
    }

    private String jobText(JobEntity job) {
        String text = String.join("\n",
                valueOrEmpty(job.getTitle()),
                valueOrEmpty(job.getDescription()),
                valueOrEmpty(job.getRequirements()));
        String truncated = truncate(text);
        if (truncated.isBlank()) throw new CustomException(422, "Job chưa có nội dung để AI Match phân tích");
        return truncated;
    }

    private String candidateText(AiMatchingCandidateProjection candidate) {
        List<String> skills = readStringList(candidate.getMatchedSkillsJson());
        List<String> strengths = readStringList(candidate.getStrengthsJson());
        String summary = valueOrEmpty(candidate.getSummary());
        if (candidate.getCandidateName() != null && !candidate.getCandidateName().isBlank()) {
            summary = summary.replaceAll("(?i)" + Pattern.quote(candidate.getCandidateName()), " ");
        }
        summary = summary.replaceAll("(?i)\\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,}\\b", " ")
                .replaceAll("(?<!\\w)(?:\\+?\\d[\\d .()-]{7,}\\d)(?!\\w)", " ");
        String text = "Kỹ năng chuyên môn: " + String.join(", ", skills)
                + "\nĐiểm mạnh chuyên môn: " + String.join(", ", strengths)
                + "\nKinh nghiệm chuyên môn: " + summary;
        return truncate(text);
    }

    private BigDecimal score(List<Double> jobVector, List<Double> candidateVector) {
        if (jobVector == null || candidateVector == null || jobVector.size() != candidateVector.size()) {
            throw new CustomException(503, "Gemini trả về vector embedding không cùng kích thước; kiểm tra model embedding");
        }
        double dot = 0;
        double jobMagnitude = 0;
        double candidateMagnitude = 0;
        for (int index = 0; index < jobVector.size(); index++) {
            double left = jobVector.get(index);
            double right = candidateVector.get(index);
            dot += left * right;
            jobMagnitude += left * left;
            candidateMagnitude += right * right;
        }
        if (jobMagnitude == 0 || candidateMagnitude == 0) {
            throw new CustomException(503, "Gemini trả về vector embedding không hợp lệ");
        }
        double cosine = dot / (Math.sqrt(jobMagnitude) * Math.sqrt(candidateMagnitude));
        double percent = Math.max(0, Math.min(100, cosine * 100));
        return BigDecimal.valueOf(percent).setScale(2, RoundingMode.HALF_UP);
    }

    private List<String> readStringList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, new TypeReference<>() {});
        } catch (Exception ignored) {
            return List.of();
        }
    }

    private boolean appearsAsTerm(String haystack, String term) {
        if (term == null || term.isBlank()) return false;
        String normalized = term.trim();
        if (normalized.length() < 2) return false;
        return Pattern.compile("(?iu)(?<![\\p{L}\\p{N}])" + Pattern.quote(normalized)
                + "(?![\\p{L}\\p{N}])").matcher(haystack).find();
    }

    private String truncate(String value) {
        int limit = Math.max(1000, maxInputChars);
        return value.length() <= limit ? value : value.substring(0, limit);
    }

    private String valueOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }
}
