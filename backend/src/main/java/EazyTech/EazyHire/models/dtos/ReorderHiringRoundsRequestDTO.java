package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotEmpty;
import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReorderHiringRoundsRequestDTO {
    @NotEmpty(message = "Danh sách thứ tự vòng tuyển dụng không được để trống")
    private List<Long> orderedIds;
}
