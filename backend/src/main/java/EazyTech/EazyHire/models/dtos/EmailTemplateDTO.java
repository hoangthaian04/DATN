package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.EmailTemplateType;
import EazyTech.EazyHire.models.enums.TemplateScope;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor
public class EmailTemplateDTO {
    private Long id; private String templateName; private EmailTemplateType type; private String subject; private String bodyHtml;
    private List<String> variables; private TemplateScope templateScope; private Boolean isActive; private LocalDateTime createdAt; private LocalDateTime updatedAt;
}
