package EazyTech.EazyHire.models.dtos;
import jakarta.validation.constraints.*;
import EazyTech.EazyHire.models.enums.CompanyStatus;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class OnboardingRequestDTO {
@Size(max=255) private String industry;
@Pattern(regexp="^(1-10|11-50|50-100|51-200|201-500|501-1000|1000\\+|1001\\+)?$", message="Quy mô công ty không hợp lệ") private String companySize;
@Pattern(regexp="^(https?://[^\\s]+)?$", message="Website phải bắt đầu bằng http:// hoặc https://") @Size(max=255) private String website;
@Size(max=5000) private String description;
@Pattern(regexp="^(\\+?[0-9][0-9 .()-]{7,19})?$", message="Số điện thoại không hợp lệ") private String phone;
@Size(max=2000) private String address;
@Pattern(regexp="^#[0-9a-fA-F]{6}$", message="Màu thương hiệu không hợp lệ") private String primaryColor;
@Size(max=5000) private String benefits;
@Size(max=255) private String businessType;
@Email @Size(max=255) private String contactEmail;
private Boolean onboardingCompleted;
}
