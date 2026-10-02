package EazyTech.EazyHire.models.dtos;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class AiMatchingContactTemplateDTO {
    private Long suggestionId;
    private String recipientName;
    private String recipientEmail;
    private String subject;
    private String body;
}
