package EazyTech.EazyHire.core;

import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class PaginationRequest implements Serializable {

    @Positive(message = "limit phải là số lớn hơn 0")
    private Integer limit = 10;

    @Positive(message = "page phải là số lớn hơn 0")
    private Integer page = 1;

    private String searchText;
    private String orderBy;

    public Map<String, String> getOrders() {
        Map<String, String> fields = new HashMap<>();
        if (orderBy != null && !orderBy.isEmpty()) {
            String[] splits = orderBy.split(",");
            for (String s : splits) {
                String[] f = s.split(":");
                if (f.length == 1) {
                    fields.put(f[0], "ASC");
                } else {
                    if ("DESC".equalsIgnoreCase(f[1])) {
                        fields.put(f[0], "DESC");
                    } else {
                        fields.put(f[0], "ASC");
                    }
                }
            }
        }
        return fields;
    }

    public Pageable getPageable() {
        int pageNumber = (page != null && page > 0) ? page - 1 : 0;
        int pageSize = (limit != null && limit > 0) ? limit : 10;

        Map<String, String> orders = getOrders();
        if (!orders.isEmpty()) {
            List<Sort.Order> sortOrders = new ArrayList<>();
            orders.forEach((field, direction) -> {
                if ("DESC".equalsIgnoreCase(direction)) {
                    sortOrders.add(Sort.Order.desc(field));
                } else {
                    sortOrders.add(Sort.Order.asc(field));
                }
            });
            return PageRequest.of(pageNumber, pageSize, Sort.by(sortOrders));
        }

        return PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
