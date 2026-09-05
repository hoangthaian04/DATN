  
package EazyTech.EazyHire.models.dtos.dashboard;  
import lombok.*;  
@Data @Builder @NoArgsConstructor @AllArgsConstructor  
public class TopStatsDTO {  
private Long totalApplicants;  
private Long processingApplicants;  
private Long passedApplicants;  
private Long failedApplicants;  
} 
