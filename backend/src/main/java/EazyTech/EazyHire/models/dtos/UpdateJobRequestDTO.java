package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateJobRequestDTO {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;
    
    private String description;
    private String requirements;
    private String benefits;
    
    @Min(value = 0, message = "Mức lương tối thiểu phải lớn hơn hoặc bằng 0")
    private BigDecimal salaryMin;
    
    @Min(value = 0, message = "Mức lương tối đa phải lớn hơn hoặc bằng 0")
    private BigDecimal salaryMax;
    
    private String currency;
    private String location;
    private String workingType;
    private String employmentType;
    private String experienceLevel;
    
    @Min(value = 0, message = "Số năm kinh nghiệm không hợp lệ")
    private Integer experienceYearsMin;
    
    @Min(value = 1, message = "Số vòng phỏng vấn tối thiểu là 1")
    private Integer roundCount;
}
