package EazyTech.EazyHire.models.dtos;
import jakarta.validation.constraints.*;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class CompanyStatusRequestDTO {
@NotNull private CompanyStatus status;
@Size(max=1000) private String reason;
}
