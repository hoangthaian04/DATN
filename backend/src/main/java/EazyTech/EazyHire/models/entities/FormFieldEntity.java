package EazyTech.EazyHire.models.entities;

import EazyTech.EazyHire.core.jpa.StringListJsonConverter;
import EazyTech.EazyHire.models.enums.FormFieldType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "form_fields")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FormFieldEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private JobEntity job;

    @Column(name = "field_name", nullable = false, length = 255)
    private String fieldName;

    @Column(nullable = false, length = 255)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "field_type", nullable = false, length = 50)
    private FormFieldType fieldType;

    @Builder.Default
    @Column(name = "is_required", nullable = false)
    private Boolean isRequired = false;

    @Convert(converter = StringListJsonConverter.class)
    @Column(columnDefinition = "TEXT")
    private List<String> options;

    @Builder.Default
    @Column(name = "order_index", nullable = false)
    private Integer orderIndex = 0;

    @Builder.Default
    @Column(name = "is_deleted", nullable = false)
    private Boolean isDeleted = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
        if (isRequired == null) isRequired = false;
        if (orderIndex == null) orderIndex = 0;
        if (isDeleted == null) isDeleted = false;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
