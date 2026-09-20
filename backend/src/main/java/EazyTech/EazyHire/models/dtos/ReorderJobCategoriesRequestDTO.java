package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.List;

@Data
public class ReorderJobCategoriesRequestDTO {
    @NotEmpty(message = "Danh sách thứ tự danh mục không được để trống")
    private List<@NotNull(message = "ID danh mục không được để trống")
            @Positive(message = "ID danh mục phải là số dương") Long> orderedIds;
}
