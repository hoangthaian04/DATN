package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.AiProviderEntity;
import EazyTech.EazyHire.models.enums.AiProviderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AiProviderRepository extends JpaRepository<AiProviderEntity, Long> {

    Optional<AiProviderEntity> findFirstByCompanyIdAndProviderCodeAndStatus(
            Long companyId,
            String providerCode,
            AiProviderStatus status
    );

    Optional<AiProviderEntity> findFirstByCompanyIdIsNullAndProviderCodeAndStatus(
            String providerCode,
            AiProviderStatus status
    );
}
