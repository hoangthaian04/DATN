package com.easytech.eazyhire.models.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
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
@Table(name = "company_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyProfileEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, unique = true)
    private CompanyEntity company;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "banner_url", columnDefinition = "TEXT")
    private String bannerUrl;

    @Column(name = "primary_color", length = 20)
    @Builder.Default
    private String primaryColor = "#2563eb";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(name = "social_links", columnDefinition = "TEXT")
    private String socialLinks;

    @Column(name = "business_type", length = 100)
    private String businessType;

    @Column(length = 150)
    private String industry;

    @Column(name = "company_size", length = 50)
    private String companySize;

    @Column(name = "onboarding_completed", nullable = false)
    @Builder.Default
    private Boolean onboardingCompleted = false;

    @Column(name = "profile_completed", nullable = false)
    @Builder.Default
    private Boolean profileCompleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.primaryColor == null) {
            this.primaryColor = "#2563eb";
        }
        if (this.onboardingCompleted == null) {
            this.onboardingCompleted = false;
        }
        if (this.profileCompleted == null) {
            this.profileCompleted = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
