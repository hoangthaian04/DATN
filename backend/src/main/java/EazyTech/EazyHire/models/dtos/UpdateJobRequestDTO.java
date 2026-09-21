package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateJobRequestDTO {
    /**
     * Optional when editing an existing Job. If omitted, the current category
     * association is preserved, including when that category is INACTIVE.
     */
    @Positive(message = "Danh mục không hợp lệ")
    private Long categoryId;

    @NotBlank(message = "Tiêu đề không được để trống")
    @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự")
    private String title;
    
    private String description;
    private String requirements;
    private String benefits;
    
    @DecimalMin(value = "0.0", message = "Mức lương tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal salaryMin;
    
    @DecimalMin(value = "0.0", message = "Mức lương tối đa phải lớn hơn hoặc bằng 0")
    private BigDecimal salaryMax;
    
    @Size(max = 10, message = "Mã tiền tệ không hợp lệ")
    private String currency;

    @Size(max = 255, message = "Địa điểm không được vượt quá 255 ký tự")
    private String location;

    @Size(max = 50, message = "Hình thức làm việc không hợp lệ")
    private String workingType;

    @Size(max = 50, message = "Loại hình công việc không hợp lệ")
    private String employmentType;

    @Size(max = 50, message = "Cấp độ kinh nghiệm không hợp lệ")
    private String experienceLevel;
    
    @Min(value = 0, message = "Số năm kinh nghiệm không hợp lệ")
    private Integer experienceYearsMin;
    
    /** Zero is valid for jobs that do not require an interview process. */
    @Min(value = 0, message = "Số vòng phỏng vấn không được âm")
    private Integer roundCount;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate endDate;
}
