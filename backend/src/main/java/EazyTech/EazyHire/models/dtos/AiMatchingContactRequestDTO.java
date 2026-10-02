package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AiMatchingContactRequestDTO {

    @NotBlank(message = "Tiêu đề email không được để trống")
    @Size(max = 255, message = "Tiêu đề email không được vượt quá 255 ký tự")
    @Pattern(regexp = "^[^\\r\\n]*$", message = "Tiêu đề email không được chứa xuống dòng")
    private String subject;

    @NotBlank(message = "Nội dung email không được để trống")
    @Size(max = 12000, message = "Nội dung email không được vượt quá 12.000 ký tự")
    private String body;
}
