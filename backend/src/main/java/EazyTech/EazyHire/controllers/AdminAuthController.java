package EazyTech.EazyHire.controllers;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.models.dtos.LoginRequestDTO;
import EazyTech.EazyHire.services.*;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
@RestController @RequestMapping("/api/v1/admin/auth") @RequiredArgsConstructor
public class AdminAuthController {
 private final AuthService authService;
 private final AuthCookieService cookies;
 @PostMapping("/login") public BaseResponse login(@Valid @RequestBody LoginRequestDTO request,HttpServletResponse response){
  return BaseResponse.success("Đăng nhập Admin thành công",cookies.write(response,authService.adminLogin(request)));
 }
}
