package EazyTech.EazyHire.models.entities;

import EazyTech.EazyHire.models.enums.AiMatchingRunStatus;
import EazyTech.EazyHire.models.enums.AiProviderSource;
import jakarta.persistence.Column;
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

@Entity
@Table(name = "ai_matching_runs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMatchingRunEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "job_id", nullable = false)
    private Long jobId;

    @Column(name = "requested_by")
    private Long requestedBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private AiMatchingRunStatus status = AiMatchingRunStatus.QUEUED;

    @Column(name = "min_score", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal minScore = BigDecimal.valueOf(70);

    @Column(name = "result_limit", nullable = false)
    @Builder.Default
    private Integer resultLimit = 10;

    @Column(name = "force_rerun", nullable = false)
    @Builder.Default
    private Boolean forceRerun = false;

    @Column(name = "provider_code", length = 100)
    private String providerCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_source", length = 50)
    private AiProviderSource providerSource;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "lease_until")
    private LocalDateTime leaseUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (status == null) status = AiMatchingRunStatus.QUEUED;
        if (minScore == null) minScore = BigDecimal.valueOf(70);
        if (resultLimit == null) resultLimit = 10;
        if (forceRerun == null) forceRerun = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
