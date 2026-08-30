package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleLoginRequestDTO {

    @NotBlank(message = "Google ID Token không được để trống")
    private String idToken;
}
