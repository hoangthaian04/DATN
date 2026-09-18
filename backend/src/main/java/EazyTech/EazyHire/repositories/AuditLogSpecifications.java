package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.AuditLogEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class AuditLogSpecifications {
    private AuditLogSpecifications() {
    }

    public static Specification<AuditLogEntity> search(
            String action,
            String email,
            LocalDateTime startDate,
            LocalDateTime endDate
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (action != null) {
                predicates.add(criteriaBuilder.equal(root.get("action"), action));
            }
            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.<LocalDateTime>get("createdAt"), startDate
                ));
            }
            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThan(
                        root.<LocalDateTime>get("createdAt"), endDate
                ));
            }
            if (email != null) {
                Subquery<Long> matchingActorIds = query.subquery(Long.class);
                Root<UserEntity> actor = matchingActorIds.from(UserEntity.class);
                matchingActorIds.select(actor.get("id"));
                matchingActorIds.where(
                        criteriaBuilder.equal(actor.get("id"), root.get("actorUserId")),
                        criteriaBuilder.like(
                                criteriaBuilder.lower(actor.<String>get("email")),
                                "%" + email.toLowerCase(Locale.ROOT) + "%"
                        )
                );
                predicates.add(criteriaBuilder.exists(matchingActorIds));
            }

            return predicates.isEmpty()
                    ? criteriaBuilder.conjunction()
                    : criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }
}
