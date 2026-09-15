package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormFieldRequestDTO {

    @Size(max = 255, message = "Tên field không được vượt quá 255 ký tự")
    private String fieldName;

    @NotBlank(message = "Nhãn field không được để trống")
    @Size(max = 255, message = "Nhãn field không được vượt quá 255 ký tự")
    private String label;

    @NotBlank(message = "Loại field không được để trống")
    private String fieldType;

    private Boolean required;

    private List<@Size(max = 255, message = "Lựa chọn không được vượt quá 255 ký tự") String> options;

    @Min(value = 0, message = "Thứ tự field không được âm")
    private Integer displayOrder;
}
