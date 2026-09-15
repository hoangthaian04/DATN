package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.FormFieldEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FormFieldRepository extends JpaRepository<FormFieldEntity, Long> {

    List<FormFieldEntity> findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(
            Long jobId,
            Long companyId
    );

    Optional<FormFieldEntity> findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(
            Long id,
            Long jobId,
            Long companyId
    );

    boolean existsByJobIdAndFieldNameAndIsDeletedFalse(Long jobId, String fieldName);

    boolean existsByJobIdAndFieldNameAndIdNotAndIsDeletedFalse(Long jobId, String fieldName, Long id);
}
