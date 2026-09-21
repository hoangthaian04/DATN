package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.EmailLogStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailLogRetryResponseDTO {
    private Long logId;
    private EmailLogStatus status;
    private LocalDateTime retriedAt;
}
