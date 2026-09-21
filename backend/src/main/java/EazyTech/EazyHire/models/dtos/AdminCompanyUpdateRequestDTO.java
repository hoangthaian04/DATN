package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Editable fields for the Admin company detail drawer. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminCompanyUpdateRequestDTO {
    @Size(max = 255, message = "Tên doanh nghiệp không được vượt quá 255 ký tự")
    private String name;
    @Size(max = 100, message = "Mã số thuế không được vượt quá 100 ký tự")
    private String taxCode;
    @Size(max = 255, message = "Subdomain không được vượt quá 255 ký tự")
    private String subdomain;
    @Size(max = 50, message = "Số điện thoại không được vượt quá 50 ký tự")
    private String phone;
    @Email(message = "Email doanh nghiệp không hợp lệ")
    @Size(max = 255, message = "Email doanh nghiệp không được vượt quá 255 ký tự")
    private String email;
    @Size(max = 255, message = "Website không được vượt quá 255 ký tự")
    private String website;
    private String address;
    @Size(max = 255, message = "Ngành nghề không được vượt quá 255 ký tự")
    private String industry;
    @Size(max = 255, message = "Quy mô công ty không được vượt quá 255 ký tự")
    private String companySize;
    @Size(max = 255, message = "Loại hình doanh nghiệp không được vượt quá 255 ký tự")
    private String businessType;
    @Email(message = "Email liên hệ không hợp lệ")
    @Size(max = 255, message = "Email liên hệ không được vượt quá 255 ký tự")
    private String contactEmail;
    private String description;
    private String benefits;
    private String socialLinks;
    @Size(max = 1000, message = "URL banner không được vượt quá 1000 ký tự")
    private String bannerUrl;
    @Size(max = 32, message = "Màu chính không hợp lệ")
    private String primaryColor;
    @Size(max = 255, message = "Tiêu đề Career Site không được vượt quá 255 ký tự")
    private String siteTitle;
    private String tagline;
    private String heroImageUrl;
    @Size(max = 32, message = "Màu nhấn không hợp lệ")
    private String accentColor;
    @Size(max = 100, message = "Font không được vượt quá 100 ký tự")
    private String fontFamily;
    private Boolean showCompanyDescription;
    private Boolean showBenefits;
    private String footerText;
}
