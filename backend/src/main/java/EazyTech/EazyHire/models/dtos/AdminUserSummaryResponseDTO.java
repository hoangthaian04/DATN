package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserSummaryResponseDTO {
    private Long id;
    private String fullName;
    private String email;
    private Long companyId;
    private String companyName;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
