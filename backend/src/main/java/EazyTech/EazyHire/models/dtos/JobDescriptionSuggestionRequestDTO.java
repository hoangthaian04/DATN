package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class JobDescriptionSuggestionRequestDTO {

    @NotBlank(message = "Tiêu đề công việc là bắt buộc")
    @Size(max = 255, message = "Tiêu đề công việc không được vượt quá 255 ký tự")
    private String title;

    @NotNull(message = "Danh mục là bắt buộc")
    @Positive(message = "Danh mục không hợp lệ")
    private Long categoryId;

    @Size(max = 50, message = "Cấp độ kinh nghiệm không hợp lệ")
    private String experienceLevel;

    @Size(max = 50, message = "Hình thức làm việc không hợp lệ")
    private String workingType;

    @Size(max = 2000, message = "Gợi ý bổ sung không được vượt quá 2000 ký tự")
    private String prompt;
}
