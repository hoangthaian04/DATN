package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyFilterRequestDTO extends PaginationRequest {
    private CompanyStatus status;
}
