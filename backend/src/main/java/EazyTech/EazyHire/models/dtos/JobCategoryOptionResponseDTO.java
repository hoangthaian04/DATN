package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/** A selectable category for HR Job forms; Admin-only metrics are intentionally excluded. */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobCategoryOptionResponseDTO {
    private Long id;
    private String name;
    private String slug;
}
