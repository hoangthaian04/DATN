package EazyTech.EazyHire.repositories;

import java.time.LocalDateTime;

public interface AiMatchingCandidateProjection {
    Long getCandidateId();
    Long getSourceApplicationId();
    String getCandidateName();
    String getEmail();
    String getSummary();
    String getMatchedSkillsJson();
    String getStrengthsJson();
    LocalDateTime getRecentApplicationAt();
}
