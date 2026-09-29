package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicJobDTO {
    private String id;
    private String slug;
    private String title;
    private String location;
    private String type;
    private String salary;
    private String category;
    private String postedAt;
    private List<String> tags;
    private String description;
    private List<String> requirements;
    private List<String> benefits;
    private Boolean requiresCv;
}
