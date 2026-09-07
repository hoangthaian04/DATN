package EazyTech.EazyHire.models.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "interviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private CompanyEntity company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "application_id", nullable = false)
    private ApplicationEntity application;

    @Column(name = "round_id")
    private Long roundId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "scheduled_by")
    private UserEntity scheduledBy;

    @Column(name = "interview_time", nullable = false)
    private LocalDateTime interviewTime;

    private Integer duration;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "candidate_note", columnDefinition = "TEXT")
    private String candidateNote;

    @Builder.Default
    @Column(length = 50, nullable = false)
    private String status = "SCHEDULED";

    @Column(name = "secure_token")
    private String secureToken;

    @Column(name = "token_expiry_at")
    private LocalDateTime tokenExpiryAt;

    @Column(name = "reschedule_time")
    private LocalDateTime rescheduleTime;

    @Column(name = "reschedule_reason", columnDefinition = "TEXT")
    private String rescheduleReason;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = "SCHEDULED";
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
