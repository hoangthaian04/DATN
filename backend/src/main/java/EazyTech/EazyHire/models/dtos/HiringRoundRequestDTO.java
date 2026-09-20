package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HiringRoundRequestDTO {
    @NotBlank(message = "Tên vòng tuyển dụng không được để trống")
    @Size(max = 255, message = "Tên vòng tuyển dụng không được vượt quá 255 ký tự")
    private String name;
    private String description;
    @Positive(message = "ID email template đạt phải là số dương")
    private Long passEmailTemplateId;
    @Positive(message = "ID email template không đạt phải là số dương")
    private Long failEmailTemplateId;
    private String testLink;
    private Boolean isFinalRound;
}
