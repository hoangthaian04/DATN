package EazyTech.EazyHire.services;
import EazyTech.EazyHire.models.entities.AuditLogEntity;
import EazyTech.EazyHire.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
@Service @RequiredArgsConstructor
public class AuditService {
 private final AuditLogRepository logs;
 public void record(Long actor,Long company,String action,String detail){
  AuditLogEntity log=new AuditLogEntity();log.setActorUserId(actor);log.setCompanyId(company);
  log.setAction(action);log.setTargetType(company==null?"USER":"COMPANY");
  log.setTargetId(company==null?actor:company);log.setMetadata(detail);
  enrichRequestMetadata(log);logs.save(log);
 }

 public void recordGlobal(Long actor,String targetType,Long targetId,String action,String detail){
  AuditLogEntity log=new AuditLogEntity();log.setActorUserId(actor);log.setCompanyId(null);
  log.setAction(action);log.setTargetType(targetType);log.setTargetId(targetId);log.setMetadata(detail);
  enrichRequestMetadata(log);logs.save(log);
 }

 public void recordTarget(Long actor,Long company,String targetType,Long targetId,String action,String detail){
  AuditLogEntity log=new AuditLogEntity();log.setActorUserId(actor);log.setCompanyId(company);
  log.setAction(action);log.setTargetType(targetType);log.setTargetId(targetId);log.setMetadata(detail);
  enrichRequestMetadata(log);logs.save(log);
 }

 private void enrichRequestMetadata(AuditLogEntity log){
  log.setCreatedAt(LocalDateTime.now());
  Authentication authentication=SecurityContextHolder.getContext().getAuthentication();
  if(authentication!=null && authentication.getAuthorities()!=null && !authentication.getAuthorities().isEmpty()){
   String authority=authentication.getAuthorities().iterator().next().getAuthority();
   log.setActorRole(authority.startsWith("ROLE_")?authority.substring(5):authority);
  }
  if(RequestContextHolder.getRequestAttributes() instanceof ServletRequestAttributes attributes){
   HttpServletRequest request=attributes.getRequest();
   String forwarded=request.getHeader("X-Forwarded-For");
   log.setIpAddress(forwarded==null || forwarded.isBlank()?request.getRemoteAddr():forwarded.split(",")[0].trim());
   log.setUserAgent(request.getHeader("User-Agent"));
   log.setRequestId(request.getHeader("X-Request-Id"));
  }
 }
}
