package EazyTech.EazyHire.models.entities;

import EazyTech.EazyHire.core.jpa.StringListJsonConverter;
import EazyTech.EazyHire.models.enums.AiProviderSource;
import EazyTech.EazyHire.models.enums.CvAnalysisStatus;
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
@Table(name = "cv_analyses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CvAnalysisEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "application_id", nullable = false)
    private Long applicationId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "matching_score", precision = 5, scale = 2)
    private BigDecimal matchingScore;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "matched_skills", columnDefinition = "TEXT")
    private List<String> matchedSkills;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "missing_skills", columnDefinition = "TEXT")
    private List<String> missingSkills;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "strengths", columnDefinition = "TEXT")
    private List<String> strengths;

    @Convert(converter = StringListJsonConverter.class)
    @Column(name = "weaknesses", columnDefinition = "TEXT")
    private List<String> weaknesses;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Column(name = "provider_code", nullable = false, length = 100)
    private String providerCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_source", nullable = false, length = 50)
    private AiProviderSource providerSource;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private CvAnalysisStatus status;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
