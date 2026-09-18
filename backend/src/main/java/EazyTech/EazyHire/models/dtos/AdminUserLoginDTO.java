package EazyTech.EazyHire.models.dtos;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class AdminUserLoginDTO {
    private String ipAddress;
    private String userAgent;
    private LocalDateTime loginAt;
}
