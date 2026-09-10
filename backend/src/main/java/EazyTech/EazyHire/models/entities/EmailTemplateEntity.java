package EazyTech.EazyHire.models.entities;

import EazyTech.EazyHire.models.enums.EmailTemplateType;
import EazyTech.EazyHire.models.enums.TemplateScope;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "email_templates")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class EmailTemplateEntity {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "company_id", nullable = false) private CompanyEntity company;
    @Column(name = "template_name", nullable = false, length = 120) private String templateName;
    @Enumerated(EnumType.STRING) @Column(nullable = false, length = 40) private EmailTemplateType type;
    @Column(nullable = false, length = 255) private String subject;
    @Column(name = "body_html", nullable = false, columnDefinition = "TEXT") private String bodyHtml;
    @Column(nullable = false, columnDefinition = "TEXT") @Builder.Default private String variables = "[]";
    @Enumerated(EnumType.STRING) @Column(name = "template_scope", nullable = false, length = 10) @Builder.Default private TemplateScope templateScope = TemplateScope.CUSTOM;
    @Column(name = "is_active", nullable = false) @Builder.Default private Boolean isActive = true;
    @Column(name = "is_deleted", nullable = false) @Builder.Default private Boolean isDeleted = false;
    @Column(name = "created_at", nullable = false, updatable = false) private LocalDateTime createdAt;
    @Column(name = "updated_at", nullable = false) private LocalDateTime updatedAt;
    @PrePersist void onCreate() { createdAt = LocalDateTime.now(); updatedAt = LocalDateTime.now(); if (isActive == null) isActive = true; if (isDeleted == null) isDeleted = false; if (templateScope == null) templateScope = TemplateScope.CUSTOM; }
    @PreUpdate void onUpdate() { updatedAt = LocalDateTime.now(); }
}
