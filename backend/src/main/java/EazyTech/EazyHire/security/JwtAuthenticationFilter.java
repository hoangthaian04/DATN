package EazyTech.EazyHire.security;
import EazyTech.EazyHire.core.*;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.services.*;
import EazyTech.EazyHire.models.entities.UserEntity;
import jakarta.servlet.*;
import jakarta.servlet.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import lombok.RequiredArgsConstructor;
import java.io.IOException;
import java.util.List;
@Component @RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
 private final JwtTokenProvider tokens;
 private final UserAccountService accounts;
 private final RedisClient redis;
 @Override protected void doFilterInternal(HttpServletRequest request,HttpServletResponse response,FilterChain chain) throws ServletException,IOException {
  String token=AuthCookieService.read(request,"access_token");
  if(token!=null && tokens.validateToken(token) && tokens.isTokenType(token,"ACCESS") && redis.get("AUTH_REVOKED_"+token)==null){
   try{
    UserEntity user=accounts.getUser(tokens.getUserIdFromToken(token));
    accounts.requireAllowed(user);
    if(user.getTokenVersion().equals(tokens.getTokenVersionFromToken(token))){
     AuthorizedUser principal=AuthorizedUser.builder().id(user.getId()).email(user.getEmail()).name(user.getFullName())
      .companyId(user.getCompany()==null?null:user.getCompany().getId())
      .companyStatus(user.getCompany()==null?null:user.getCompany().getStatus().name())
      .roles(List.of("ROLE_"+user.getRole().name())).build();
     SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(principal,null,principal.getAuthorities()));
    }
   }catch(CustomException ignored){SecurityContextHolder.clearContext();}
  }
  chain.doFilter(request,response);
 }
}
