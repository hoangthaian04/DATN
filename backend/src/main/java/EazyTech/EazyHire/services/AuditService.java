package EazyTech.EazyHire.services;
import EazyTech.EazyHire.models.entities.AuditLogEntity;
import EazyTech.EazyHire.repositories.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
@Service @RequiredArgsConstructor
public class AuditService {
 private final AuditLogRepository logs;
 public void record(Long actor,Long company,String action,String detail){
  AuditLogEntity log=new AuditLogEntity();log.setActorUserId(actor);log.setCompanyId(company);
  log.setAction(action);log.setTargetType(company==null?"USER":"COMPANY");
  log.setTargetId(company==null?actor:company);log.setMetadata(detail);
  log.setCreatedAt(LocalDateTime.now());logs.save(log);
 }
}
