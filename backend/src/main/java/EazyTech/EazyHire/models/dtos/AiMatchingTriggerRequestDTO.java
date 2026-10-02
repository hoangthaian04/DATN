package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMatchingTriggerRequestDTO {

    @Builder.Default
    private Boolean forceRerun = false;

    @DecimalMin("0.00")
    @DecimalMax("100.00")
    @Builder.Default
    private BigDecimal minScore = BigDecimal.valueOf(70);

    @Min(1)
    @Max(10)
    @Builder.Default
    private Integer limit = 10;
}
