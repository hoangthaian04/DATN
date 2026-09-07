package EazyTech.EazyHire.models.dtos;
import jakarta.validation.constraints.*;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class RegistrationUpdateRequestDTO {
@NotBlank @Size(max=255) private String companyName;
@NotBlank @Pattern(regexp="^[0-9]{10}(-?[0-9]{3})?$",message="Mã số thuế gồm 10 hoặc 13 chữ số") private String taxCode;
@NotBlank @Pattern(regexp="^\\+?[0-9][0-9 .()-]{7,19}$",message="Số điện thoại không hợp lệ") private String phone;
@NotBlank @Size(max=2000) private String address;
@Pattern(regexp="^[a-z0-9]+(?:-[a-z0-9]+)*$") @Size(max=63) private String subdomain;
}
