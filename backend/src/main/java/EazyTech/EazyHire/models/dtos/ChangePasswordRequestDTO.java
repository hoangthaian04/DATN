package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class ChangePasswordRequestDTO {
    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    @Size(max = 72, message = "Mật khẩu hiện tại tối đa 72 ký tự")
    private String currentPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 8, max = 72, message = "Mật khẩu phải từ 8 đến 72 ký tự")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[0-9]).+$", message = "Mật khẩu phải có chữ hoa và chữ số")
    private String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu không được để trống")
    @Size(max = 72, message = "Xác nhận mật khẩu tối đa 72 ký tự")
    private String confirmPassword;
}
