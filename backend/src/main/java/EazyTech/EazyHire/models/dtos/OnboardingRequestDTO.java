package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OnboardingRequestDTO {

    @NotBlank(message = "Tên công ty không được để trống")
    @Size(max = 255, message = "Tên công ty không quá 255 ký tự")
    private String companyName;

    private String taxCode;

    private String phone;

    private String email;

    private String website;

    private String address;

    private String logoUrl;

    private String bannerUrl;

    private String primaryColor;

    private String description;

    private String benefits;
}
