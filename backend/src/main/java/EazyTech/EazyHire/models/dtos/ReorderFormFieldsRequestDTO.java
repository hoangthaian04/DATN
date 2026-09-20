package EazyTech.EazyHire.models.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReorderFormFieldsRequestDTO {
    @NotNull(message = "Danh sách thứ tự field không được để trống")
    @Valid
    private List<@NotNull(message = "ID field không được để trống") Long> orderedIds;
}
