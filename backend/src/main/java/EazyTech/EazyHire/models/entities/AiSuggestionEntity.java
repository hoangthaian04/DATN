package EazyTech.EazyHire.models.entities;

import EazyTech.EazyHire.core.jpa.StringListJsonConverter;
import EazyTech.EazyHire.models.enums.AiSuggestionContactStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "ai_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSuggestionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "candidate_id", nullable = false)
    private Long candidateId;

    @Column(name = "source_application_id")
    private Long sourceApplicationId;

    @Column(name = "run_id", nullable = false)
    private Long runId;

    @Column(name = "matching_score", nullable = false, precision = 5, scale = 2)
    private BigDecimal matchingScore;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "matched_skills", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private List<String> matchedSkills = List.of();

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "strengths", nullable = false, columnDefinition = "TEXT")
    @Builder.Default
    private List<String> strengths = List.of();

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "recent_application_at", nullable = false)
    private LocalDateTime recentApplicationAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "contact_status", nullable = false, length = 20)
    @Builder.Default
    private AiSuggestionContactStatus contactStatus = AiSuggestionContactStatus.NOT_CONTACTED;

    @Column(name = "contacted_at")
    private LocalDateTime contactedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (contactStatus == null) contactStatus = AiSuggestionContactStatus.NOT_CONTACTED;
        if (matchedSkills == null) matchedSkills = List.of();
        if (strengths == null) strengths = List.of();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
