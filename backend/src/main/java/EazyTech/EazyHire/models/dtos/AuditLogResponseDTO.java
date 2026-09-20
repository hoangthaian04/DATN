package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponseDTO {
    private Long id;
    private AuditActorDTO actor;
    private Long companyId;
    private String companyName;
    private String action;
    private String targetType;
    private Long targetId;
    private String ipAddress;
    private LocalDateTime createdAt;
}
