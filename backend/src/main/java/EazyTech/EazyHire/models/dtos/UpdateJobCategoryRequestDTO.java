package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateJobCategoryRequestDTO {
    @Size(max = 255, message = "Tên danh mục không được vượt quá 255 ký tự")
    private String name;

    private JobCategoryStatus status;
}
