package EazyTech.EazyHire.services;
import EazyTech.EazyHire.models.dtos.dashboard.DashboardContractDTO.*;
import EazyTech.EazyHire.models.dtos.dashboard.TodoItemDTO;
import EazyTech.EazyHire.models.entities.*;
import EazyTech.EazyHire.repositories.*;
import EazyTech.EazyHire.core.exceptions.CustomException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.*;
import java.util.*;
@Service @RequiredArgsConstructor @Transactional(readOnly=true)
public class DashboardContractService {
 private final UserAccountService accounts;
 private final JobRepository jobs;
 private final ApplicationRepository applications;
 private final InterviewRepository interviews;
 private Long company(Long userId){return accounts.requireHr(userId,true).getCompany().getId();}
 private LocalDateTime start(String range){
  LocalDate now=LocalDate.now();
  return switch(range){
   case "7d" -> now.minusDays(6).atStartOfDay();
   case "30d" -> now.minusDays(29).atStartOfDay();
   case "this_month" -> now.withDayOfMonth(1).atStartOfDay();
   case "this_year" -> now.withDayOfYear(1).atStartOfDay();
   case "6m" -> now.withDayOfMonth(1).minusMonths(5).atStartOfDay();
   default -> throw new CustomException(400,"Khoảng thời gian không hợp lệ.");
  };
 }
 public Stats getStats(Long userId,String range){
  Long id=company(userId);LocalDateTime now=LocalDateTime.now();
  List<ApplicationEntity> rows=applications.findByCompanyIdAndCreatedAtBetween(id,start(range),now);
  long hired=rows.stream().filter(a->"HIRED".equals(a.getStatus())).count();
  long rejected=rows.stream().filter(a->"REJECTED".equals(a.getStatus())).count();
  long active=rows.stream().filter(a->"ACTIVE".equals(a.getStatus())).count();
  long fresh=rows.stream().filter(a->"ACTIVE".equals(a.getStatus())&&Integer.valueOf(0).equals(a.getCurrentStep())).count();
  long open=jobs.findByCompanyIdAndIsDeletedFalse(id).stream().filter(j->"ACTIVE".equals(j.getStatus())).count();
  long upcoming=interviews.countByCompanyIdAndStatusAndInterviewTimeBetween(id,"SCHEDULED",now,now.plusDays(7));
  double rate=rows.isEmpty()?0:100.0*hired/rows.size();
  // Hiring duration depends on the future explicit Hire action (US-24).
  return new Stats(rows.size(),active,hired,rejected,rate,0,open,fresh,upcoming,rate);
 }
 public Charts getCharts(Long userId,String range,String metric){
  if(!"applications".equals(metric))throw new CustomException(400,"Metric không hợp lệ. Chọn applications.");
  Long id=company(userId);LocalDateTime from=start(range);
  List<ApplicationEntity> rows=applications.findByCompanyIdAndCreatedAtBetween(id,from,LocalDateTime.now());
  Map<String,Long> values=new LinkedHashMap<>();
  for(LocalDate day=from.toLocalDate();!day.isAfter(LocalDate.now());day=day.plusDays(1)){
   String label="6m".equals(range)?YearMonth.from(day).toString():day.toString();values.putIfAbsent(label,0L);
  }
  for(ApplicationEntity a:rows){String label="6m".equals(range)?YearMonth.from(a.getCreatedAt()).toString():a.getCreatedAt().toLocalDate().toString();values.computeIfPresent(label,(k,v)->v+1);}
  return new Charts(range,metric,values.entrySet().stream().map(e->new Point(e.getKey(),e.getValue())).toList());
 }
 public TopJobs getTopJobs(Long userId,String range,int limit){
  if(limit<1||limit>100)throw new CustomException(400,"Limit phải từ 1 đến 100.");
  Long id=company(userId);List<ApplicationEntity> rows=applications.findByCompanyIdAndCreatedAtBetween(id,start(range),LocalDateTime.now());
  List<TopJob> result=jobs.findByCompanyIdAndIsDeletedFalse(id).stream().map(j->new TopJob(j.getId(),j.getTitle(),"",j.getLocation(),
   rows.stream().filter(a->a.getJob().getId().equals(j.getId())).count(),j.getStatus()))
   .sorted(Comparator.comparingLong(TopJob::applicationCount).reversed().thenComparing(TopJob::id)).limit(limit).toList();
  return new TopJobs(result,result.size());
 }
 public List<TodoItemDTO> getTodos(Long userId){
  Long id=company(userId);List<TodoItemDTO> result=new ArrayList<>();
  applications.findTop5ByCompanyIdAndStatusOrderByCreatedAtDesc(id,"ACTIVE").stream()
   .filter(a->Integer.valueOf(0).equals(a.getCurrentStep())).forEach(a->result.add(TodoItemDTO.builder().type("NEW_APPLICATION")
    .title("Hồ sơ mới cần xem xét").referenceId(a.getId()).createdAt(a.getCreatedAt()).build()));
  interviews.findTop5ByCompanyIdAndStatusAndInterviewTimeBetweenOrderByInterviewTimeAsc(id,"SCHEDULED",LocalDateTime.now(),LocalDate.now().plusDays(2).atStartOfDay())
   .forEach(i->result.add(TodoItemDTO.builder().type("UPCOMING_INTERVIEW").title("Lịch phỏng vấn sắp tới").referenceId(i.getId()).createdAt(i.getInterviewTime()).build()));
  interviews.findTop5ByCompanyIdAndStatusInOrderByUpdatedAtDesc(id,List.of("DECLINED","RESCHEDULE_REQUESTED"))
   .forEach(i->result.add(TodoItemDTO.builder().type("REJECTED_INTERVIEW").title("Ứng viên phản hồi lịch phỏng vấn").referenceId(i.getId()).createdAt(i.getUpdatedAt()).build()));
  return result;
 }
}
