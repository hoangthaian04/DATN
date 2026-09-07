package EazyTech.EazyHire.models.entities;

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
@Table(name = "career_sites")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CareerSiteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "logo_url", columnDefinition = "TEXT") private String logoUrl;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, unique = true)
    private CompanyEntity company;

    @Column(name = "site_title")
    private String siteTitle;

    private String tagline;

    @Column(name = "hero_image_url", columnDefinition = "TEXT")
    private String heroImageUrl;

    @Column(name = "accent_color", length = 20)
    @Builder.Default
    private String accentColor = "#2563eb";

    @Column(name = "font_family", length = 100)
    @Builder.Default
    private String fontFamily = "Inter";

    @Column(name = "show_company_description")
    @Builder.Default
    private Boolean showCompanyDescription = true;

    @Column(name = "show_benefits")
    @Builder.Default
    private Boolean showBenefits = true;

    @Column(name = "footer_text", columnDefinition = "TEXT")
    private String footerText;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.accentColor == null) {
            this.accentColor = "#2563eb";
        }
        if (this.fontFamily == null) {
            this.fontFamily = "Inter";
        }
        if (this.showCompanyDescription == null) {
            this.showCompanyDescription = true;
        }
        if (this.showBenefits == null) {
            this.showBenefits = true;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
