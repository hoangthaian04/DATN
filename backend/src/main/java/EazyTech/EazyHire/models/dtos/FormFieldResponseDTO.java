package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FormFieldResponseDTO {
    private Long id;
    private Long jobId;
    private String fieldName;
    private String label;
    private String fieldType;
    private Boolean required;
    private List<String> options;
    private Integer displayOrder;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
