package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import lombok.Getter;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

@Getter
@Setter
public class AdminUserFilterRequestDTO {
    private Integer page = 1;
    private Integer limit = 20;
    private String search;
    private Long companyId;
    private UserRole role;
    private UserStatus status;

    public Pageable getPageable() {
        int safePage = page == null || page < 1 ? 1 : page;
        int safeLimit = limit == null || limit < 1 ? 20 : Math.min(limit, 100);
        return PageRequest.of(
                safePage - 1,
                safeLimit,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))
        );
    }

    public String normalizedSearch() {
        return search == null || search.isBlank() ? null : search.trim();
    }
}
