package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderHiringRoundsRequestDTO {
    @NotEmpty(message = "Danh sách thứ tự vòng tuyển dụng không được để trống")
    private List<@NotNull(message = "ID vòng tuyển dụng không được để trống") @Positive(message = "ID vòng tuyển dụng phải là số dương") Long> orderedIds;
}
