package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicFormFieldResponseDTO {
    private Long id;
    private String fieldName;
    private String label;
    private String fieldType;
    private Boolean required;
    private List<String> options;
    private Integer displayOrder;
}
