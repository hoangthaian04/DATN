package EazyTech.EazyHire.models.dtos;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AdminUserCompanyDTO {
    private Long id;
    private String name;
}
