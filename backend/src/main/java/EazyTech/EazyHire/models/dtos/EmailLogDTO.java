package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.EmailLogStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLogDTO {
    private Long id;
    private Long applicationId;
    private String recipientEmail;
    private String templateCode;
    private EmailLogStatus status;
    private String subject;
    private String bodyHtml;
    private LocalDateTime sentAt;
    private LocalDateTime retriedAt;
    private String errorMessage;
    private Integer attemptCount;
    private LocalDateTime createdAt;
}
