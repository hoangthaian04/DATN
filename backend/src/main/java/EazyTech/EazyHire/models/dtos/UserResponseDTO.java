package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.CompanyStatus;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponseDTO {
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private UserRole role;
    private UserStatus status;
    private Long companyId;
    private String companyName;
    private String companySlug;
    private CompanyStatus companyStatus;
    private LocalDateTime createdAt;
}
