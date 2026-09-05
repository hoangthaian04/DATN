package EazyTech.EazyHire.models.dtos.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EffectivenessDTO {
    private Double conversionRate;
    private Double avgHireTimeDays;
    private String topSource;
    private Double offerAcceptanceRate;
}
