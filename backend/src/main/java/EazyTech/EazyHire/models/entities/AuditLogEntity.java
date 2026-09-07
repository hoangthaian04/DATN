package EazyTech.EazyHire.models.entities;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity @Table(name="audit_logs") @Getter @Setter @NoArgsConstructor
public class AuditLogEntity {
 @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;
 @Column(name="company_id") private Long companyId;
 @Column(name="actor_user_id") private Long actorUserId;
 @Column(name="actor_role",length=50) private String actorRole;
 @Column(nullable=false,length=100) private String action;
 @Column(name="target_type",nullable=false,length=100) private String targetType;
 @Column(name="target_id") private Long targetId;
 @Column(columnDefinition="TEXT") private String metadata;
 @Column(name="created_at",nullable=false) private LocalDateTime createdAt;
}
