package EazyTech.EazyHire.models.dtos.dashboard;
import java.util.List;
public final class DashboardContractDTO {
 private DashboardContractDTO(){}
 public record Stats(long totalApplications,long processingApplications,long passedApplications,long rejectedApplications,
  double conversionRate,double averageHiringDays,long totalActiveJobs,long newApplications,long upcomingInterviews,double hireRate){}
 public record Point(String label,long value){}
 public record Charts(String range,String metric,List<Point> points){}
 public record TopJob(Long id,String title,String department,String location,long applicationCount,String status){}
 public record TopJobs(List<TopJob> items,long total){}
}
