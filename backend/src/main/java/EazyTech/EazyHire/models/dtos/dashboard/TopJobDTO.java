package EazyTech.EazyHire.models.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopJobDTO {
    private String title;
    private String department;
    private String location;
    private Long applicationsCount;
    private String status;
}
