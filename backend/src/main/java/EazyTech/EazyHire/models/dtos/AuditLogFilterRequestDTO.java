package EazyTech.EazyHire.models.dtos;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Positive;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
public class AuditLogFilterRequestDTO {
    @Positive(message = "page phải là số lớn hơn 0")
    private Integer page = 1;

    @Positive(message = "limit phải là số lớn hơn 0")
    @Max(value = 100, message = "limit không được lớn hơn 100")
    private Integer limit = 50;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate startDate;

    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate endDate;

    private String action;
    private String email;

    public Pageable getPageable() {
        return PageRequest.of(
                Math.max(0, page == null ? 0 : page - 1),
                limit == null ? 50 : limit,
                Sort.by(Sort.Order.desc("createdAt"), Sort.Order.desc("id"))
        );
    }

    public LocalDateTime getStartDateTime() {
        return startDate == null ? null : startDate.atStartOfDay();
    }

    public LocalDateTime getEndDateTimeExclusive() {
        return endDate == null ? null : endDate.plusDays(1).atStartOfDay();
    }

    public String normalizedAction() {
        return action == null || action.isBlank() ? null : action.trim();
    }

    public String normalizedEmail() {
        return email == null || email.isBlank() ? null : email.trim();
    }
}
