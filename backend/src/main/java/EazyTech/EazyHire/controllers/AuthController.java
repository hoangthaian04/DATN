package EazyTech.EazyHire.controllers;
import EazyTech.EazyHire.core.*;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.*;
import EazyTech.EazyHire.services.*;
import jakarta.servlet.http.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.web.csrf.CsrfToken;
import java.util.Map;
@RestController @RequestMapping("/api/v1/auth") @RequiredArgsConstructor
public class AuthController {
 private final AuthService authService;
 private final AuthCookieService cookies;
 @PostMapping("/register") @ResponseStatus(HttpStatus.CREATED)
 public BaseResponse register(@Valid @RequestBody RegisterRequestDTO request,HttpServletResponse response){
  LoginResponseDTO login=cookies.write(response,authService.register(request));
  return BaseResponse.success("Đăng ký thành công, hồ sơ đang chờ Admin phê duyệt",Map.of("email",login.getUser().getEmail(),"companyName",login.getUser().getCompanyName(),"companyStatus",login.getUser().getCompanyStatus()));
 }
 @PostMapping("/login") public BaseResponse login(@Valid @RequestBody LoginRequestDTO request,HttpServletResponse response){
  return BaseResponse.success("Đăng nhập thành công",cookies.write(response,authService.login(request)));
 }
 @GetMapping("/me") public BaseResponse me(){return BaseResponse.success("Lấy thông tin tài khoản thành công",authService.getMe(currentId()));}
 @GetMapping("/csrf") public BaseResponse csrf(CsrfToken token){return BaseResponse.success(Map.of("token",token.getToken()));}
 @PostMapping("/refresh") public BaseResponse refresh(HttpServletRequest request,HttpServletResponse response){
  return BaseResponse.success("Làm mới phiên thành công",cookies.refresh(request,response));
 }
 @PostMapping("/logout") public BaseResponse logout(HttpServletRequest request,HttpServletResponse response){cookies.logout(request,response);return BaseResponse.success("Đăng xuất thành công");}
 @PostMapping("/forgot-password") public BaseResponse forgot(@Valid @RequestBody ForgotPasswordRequestDTO request){
  authService.forgotPassword(request.getEmail());
  return BaseResponse.success("Nếu email tồn tại trong hệ thống, hướng dẫn đặt lại mật khẩu sẽ được gửi.");
 }
 @PostMapping("/verify-otp") public BaseResponse verify(@Valid @RequestBody VerifyOtpRequestDTO request){
  return BaseResponse.success("Xác thực OTP thành công.",Map.of("resetToken",authService.verifyOtp(request.getEmail(),request.getOtp()),"expiresInSeconds",900));
 }
 @PostMapping("/reset-password") public BaseResponse reset(@Valid @RequestBody ResetPasswordRequestDTO request){
  authService.resetPassword(request.getResetToken(),request.getNewPassword(),request.getConfirmPassword());
  return BaseResponse.success("Đặt lại mật khẩu thành công.");
 }
 @PostMapping("/change-password") public BaseResponse change(@Valid @RequestBody ChangePasswordRequestDTO request,HttpServletResponse response){
  cookies.write(response,authService.changePassword(currentId(),request.getCurrentPassword(),request.getNewPassword(),request.getConfirmPassword()));
  return BaseResponse.success("Đổi mật khẩu thành công.");
 }
 public static Long currentId(){return SecurityUtils.getCurrentUser().orElseThrow(()->new CustomException(401,"Vui lòng đăng nhập.")).getId();}
}
