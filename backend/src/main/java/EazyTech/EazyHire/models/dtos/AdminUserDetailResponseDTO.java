package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
public class AdminUserDetailResponseDTO {
    private Long id;
    private String fullName;
    private String email;
    private String avatarUrl;
    private UserRole role;
    private UserStatus status;
    private AdminUserCompanyDTO company;
    private long jobsCreatedCount;
    private List<AdminUserLoginDTO> recentLogins;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
}
