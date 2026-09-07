package EazyTech.EazyHire.models.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TodoItemDTO {
    private String type; // "NEW_APPLICATION", "UPCOMING_INTERVIEW", "REJECTED_INTERVIEW"
    private String title;
    private String description;
    private Long referenceId;
    private LocalDateTime createdAt;
}
