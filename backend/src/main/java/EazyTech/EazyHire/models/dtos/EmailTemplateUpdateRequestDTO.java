package EazyTech.EazyHire.models.dtos;

import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class EmailTemplateUpdateRequestDTO {
    private String bodyHtml;
    private Boolean isActive;
}
