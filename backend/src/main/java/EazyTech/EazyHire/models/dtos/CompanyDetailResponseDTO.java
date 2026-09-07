package EazyTech.EazyHire.models.dtos;

import EazyTech.EazyHire.models.enums.CompanyStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanyDetailResponseDTO {
    private Long id;
    private String name;
    private String slug;
    private String subdomain;
    private String taxCode;
    private String phone;
    private String email;
    private String website;
    private String address;
    private CompanyStatus status;
    private Long approvedById;
    private String approvedByName;
    private LocalDateTime approvedAt;
    private String rejectedReason;
    private CompanyProfileDTO profile;
    private CareerSiteDTO careerSite;
    @Builder.Default
    private List<String> duplicateWarnings = List.of();
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
