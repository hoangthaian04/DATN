package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PublicApplicationAnswerDTO {
    private Long questionId;
    private String answer;
}
