package EazyTech.EazyHire.models.dtos;
import jakarta.validation.constraints.*;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class RegisterRequestDTO {
@NotBlank @Email @Size(max=255) private String email;
@NotBlank @Size(min=8,max=72,message="Mật khẩu phải từ 8 đến 72 ký tự") @Pattern(regexp="^(?=.*[A-Z])(?=.*[0-9]).+$",message="Mật khẩu phải có chữ hoa và chữ số") private String password;
@NotBlank @Size(max=255) private String fullName;
@NotBlank @Size(max=255) private String companyName;
@NotBlank @Pattern(regexp="^[0-9]{10}(-?[0-9]{3})?$",message="Mã số thuế gồm 10 hoặc 13 chữ số") private String taxCode;
@NotBlank @Pattern(regexp="^\\+?[0-9][0-9 .()-]{7,19}$",message="Số điện thoại không hợp lệ") private String phone;
@NotBlank @Size(max=2000) private String address;
@NotBlank @Pattern(regexp="^[a-z0-9]+(?:-[a-z0-9]+)*$",message="Subdomain chỉ gồm chữ thường, số và dấu gạch ngang") @Size(max=63) private String subdomain;
@Pattern(regexp="^(https?://[^\\s]+)?$",message="Website không hợp lệ") @Size(max=255) private String website;
@NotBlank @Size(max=255) private String industry;
@NotBlank @Pattern(regexp="^(1-10|11-50|50-100|51-200|201-500|501-1000|1000\\+|1001\\+)$",message="Quy mô công ty không hợp lệ") private String companySize;
@NotBlank @Size(max=5000) private String description;
@Pattern(regexp="^(https?://[^\\s]+)?$",message="URL logo không hợp lệ") @Size(max=2000) private String logoUrl;
}
