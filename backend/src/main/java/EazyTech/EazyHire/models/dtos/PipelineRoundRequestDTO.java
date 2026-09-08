package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class PipelineRoundRequestDTO {
    /** Null means this is a new round. */
    private Long id;

    @NotBlank(message = "Tên vòng tuyển dụng không được để trống")
    @Size(max = 255, message = "Tên vòng tuyển dụng không được vượt quá 255 ký tự")
    private String name;
    private String description;
    private Long passEmailTemplateId;
    private Long failEmailTemplateId;
    private String testLink;
    private Boolean isFinalRound;
}
