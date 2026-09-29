package EazyTech.EazyHire.models.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PublicCompanyDTO {
    private String name;
    private String slug;
    private String website;
    private String location;
    private String size;
    private String founded;
    private String email;
    private String slogan;
    private String averageAge;
    private List<String> businessSectors;
    private List<String> mainSector;
    private List<String> services;
    private String description;
    private List<String> fullDescription;
    private FooterDTO footer;
    private String logoUrl;
    private String bannerUrl;
    private String primaryColor;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FooterDTO {
        private String description;
        private String facebook;
        private String linkedin;
        private String copyright;
    }
}
