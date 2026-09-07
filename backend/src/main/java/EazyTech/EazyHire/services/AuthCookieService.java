package EazyTech.EazyHire.services;
import EazyTech.EazyHire.core.RedisClient;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.LoginResponseDTO;
import EazyTech.EazyHire.security.JwtTokenProvider;
import jakarta.servlet.http.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import java.time.Duration;
import java.util.Arrays;
@Service @RequiredArgsConstructor
public class AuthCookieService {
 private final JwtTokenProvider tokens;
 private final RedisClient redis;
 private final AuthService auth;
 @Value("${app.cookie-secure:false}") private boolean secure;
 public LoginResponseDTO write(HttpServletResponse response,LoginResponseDTO login){
  set(response,"access_token",login.getAccessToken(),tokens.getAccessTokenExpirationMs()/1000);
  set(response,"refresh_token",login.getRefreshToken(),tokens.getRefreshTokenExpirationMs()/1000);
  redis.set("AUTH_REFRESH_"+login.getRefreshToken(),"valid",tokens.getRefreshTokenExpirationMs()/1000);
  return login;
 }
 private void set(HttpServletResponse response,String name,String value,long seconds){
  response.addHeader(HttpHeaders.SET_COOKIE,ResponseCookie.from(name,value).httpOnly(true).secure(secure)
    .sameSite("Lax").path("/").maxAge(Duration.ofSeconds(seconds)).build().toString());
 }
 public LoginResponseDTO refresh(HttpServletRequest request,HttpServletResponse response){
  String token=read(request,"refresh_token");
  LoginResponseDTO login=auth.refreshToken(token);
  if(!redis.consumeIfEqual("AUTH_REFRESH_"+token,"valid"))throw new CustomException(401,"Phiên làm việc đã hết hạn.");
  return write(response,login);
 }
 public void logout(HttpServletRequest request,HttpServletResponse response){
  String refresh=read(request,"refresh_token"), access=read(request,"access_token");
  if(refresh!=null)redis.delete("AUTH_REFRESH_"+refresh);
  if(access!=null)redis.set("AUTH_REVOKED_"+access,"1",tokens.getAccessTokenExpirationMs()/1000);
  set(response,"access_token","",0);set(response,"refresh_token","",0);
 }
 public static String read(HttpServletRequest request,String name){
  return request.getCookies()==null?null:Arrays.stream(request.getCookies()).filter(c->name.equals(c.getName())).map(Cookie::getValue).findFirst().orElse(null);
 }
}
