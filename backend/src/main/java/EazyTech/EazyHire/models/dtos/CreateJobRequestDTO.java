package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateJobRequestDTO {

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;

    @NotNull(message = "Danh mục là bắt buộc")
    @Positive(message = "Danh mục không hợp lệ")
    private Long categoryId;

    @NotBlank(message = "Địa điểm làm việc không được để trống")
    @Size(max = 255, message = "Địa điểm không được vượt quá 255 ký tự")
    private String location;

    @NotNull(message = "Mức lương tối thiểu là bắt buộc")
    @DecimalMin(value = "0.0", message = "Mức lương tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal salaryMin;

    @NotNull(message = "Mức lương tối đa là bắt buộc")
    @DecimalMin(value = "0.0", message = "Mức lương tối đa phải lớn hơn hoặc bằng 0")
    private BigDecimal salaryMax;

    @Size(max = 10, message = "Mã tiền tệ không hợp lệ")
    private String currency;

    @NotBlank(message = "Hình thức làm việc không được để trống")
    private String workingType;

    @NotBlank(message = "Loại hình công việc không được để trống")
    private String employmentType;

    private String experienceLevel;

    @Min(value = 0, message = "Số năm kinh nghiệm không hợp lệ")
    private Integer experienceYearsMin;

    private String description;
    private String requirements;
    private String benefits;
}
