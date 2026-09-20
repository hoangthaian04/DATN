package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.CandidateEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CandidateRepository extends JpaRepository<CandidateEntity, Long> {

    Optional<CandidateEntity> findByCompanyIdAndEmailIgnoreCase(Long companyId, String email);
}
