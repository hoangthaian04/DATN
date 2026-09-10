package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.EmailTemplateType;
import jakarta.validation.constraints.*;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailTemplateCreateRequestDTO {
    @NotBlank @Size(max = 120) private String templateName;
    @NotNull private EmailTemplateType type;
    @NotBlank @Size(max = 255) private String subject;
    @NotBlank private String bodyHtml;
    private Boolean isActive = true;
}
