package EazyTech.EazyHire.models.dtos;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HiringRoundDTO {
    private Long id;
    private String name;
    private String description;
    private Integer orderIndex;
    private Long passEmailTemplateId;
    private Long failEmailTemplateId;
    private String testLink;
    private Boolean isFinalRound;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
