package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ReorderJobCategoriesRequestDTO {
    @NotEmpty(message = "Danh sách thứ tự danh mục không được để trống")
    private List<Long> orderedIds;
}
