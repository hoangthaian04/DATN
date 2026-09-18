package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.ApplicationAnswerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ApplicationAnswerRepository extends JpaRepository<ApplicationAnswerEntity, Long> {
}
