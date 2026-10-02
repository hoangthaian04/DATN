package EazyTech.EazyHire.models.entities;

import EazyTech.EazyHire.models.enums.AiProviderStatus;
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

import java.time.LocalDateTime;

@Entity
@Table(name = "ai_providers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiProviderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "company_id")
    private Long companyId;

    @Column(name = "provider_name", nullable = false, length = 100)
    private String providerName;

    @Column(name = "provider_code", nullable = false, length = 100)
    private String providerCode;

    @Column(name = "api_key_encrypted", columnDefinition = "TEXT")
    private String apiKeyEncrypted;

    @Column(name = "model_name", length = 100)
    private String modelName;

    @Builder.Default
    @Column(name = "max_daily_requests", nullable = false)
    private Integer maxDailyRequests = 100;

    @Builder.Default
    @Column(name = "max_reruns_per_candidate", nullable = false)
    private Integer maxRerunsPerCandidate = 3;

    @Builder.Default
    @Column(name = "daily_token_budget", nullable = false)
    private Integer dailyTokenBudget = 200000;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    @Builder.Default
    private AiProviderStatus status = AiProviderStatus.ACTIVE;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (maxDailyRequests == null) maxDailyRequests = 100;
        if (maxRerunsPerCandidate == null) maxRerunsPerCandidate = 3;
        if (dailyTokenBudget == null) dailyTokenBudget = 200000;
        if (status == null) status = AiProviderStatus.ACTIVE;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
