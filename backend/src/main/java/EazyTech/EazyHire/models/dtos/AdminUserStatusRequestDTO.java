package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.UserStatus;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AdminUserStatusRequestDTO {
    @NotNull(message = "Trạng thái là bắt buộc")
    private UserStatus status;

    @Size(max = 1000, message = "Lý do không được vượt quá 1000 ký tự")
    private String reason;

    @AssertTrue(message = "Lý do là bắt buộc khi vô hiệu hóa tài khoản")
    public boolean isReasonValid() {
        return status != UserStatus.INACTIVE || (reason != null && !reason.isBlank());
    }
}
