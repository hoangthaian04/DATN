package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RejectCompanyRequestDTO {

    @NotBlank(message = "Lý do từ chối không được để trống")
    @Size(min = 10, max = 1000, message = "Lý do từ chối phải từ 10 đến 1000 ký tự")
    private String reason;
}
