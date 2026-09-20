package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class AdminUserSpecifications {
    private AdminUserSpecifications() {
    }

    public static Specification<UserEntity> search(
            String search,
            Long companyId,
            UserRole role,
            UserStatus status
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (search != null) {
                String pattern = "%" + search.toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("fullName")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.<String>get("email")), pattern)
                ));
            }
            if (companyId != null) {
                predicates.add(criteriaBuilder.equal(
                        root.join("company", JoinType.LEFT).get("id"), companyId
                ));
            }
            if (role != null) {
                predicates.add(criteriaBuilder.equal(root.<UserRole>get("role"), role));
            }
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.<UserStatus>get("status"), status));
            }

            return predicates.isEmpty()
                    ? criteriaBuilder.conjunction()
                    : criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
