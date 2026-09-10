package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.EmailTemplateEntity;
import EazyTech.EazyHire.models.enums.EmailTemplateType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface EmailTemplateRepository extends JpaRepository<EmailTemplateEntity, Long> {
    Page<EmailTemplateEntity> findByCompanyIdAndIsDeletedFalseAndTemplateNameContainingIgnoreCase(Long companyId, String keyword, Pageable pageable);
    Page<EmailTemplateEntity> findByCompanyIdAndIsDeletedFalseAndType(Long companyId, EmailTemplateType type, Pageable pageable);
    Page<EmailTemplateEntity> findByCompanyIdAndIsDeletedFalseAndTypeAndIsActiveTrue(Long companyId, EmailTemplateType type, Pageable pageable);
    Page<EmailTemplateEntity> findByCompanyIdAndIsDeletedFalseAndIsActiveTrue(Long companyId, Pageable pageable);
    Page<EmailTemplateEntity> findByCompanyIdAndIsDeletedFalse(Long companyId, Pageable pageable);
    Optional<EmailTemplateEntity> findByIdAndCompanyIdAndIsDeletedFalse(Long id, Long companyId);
    boolean existsByCompanyIdAndIsDeletedFalseAndTemplateNameIgnoreCase(Long companyId, String templateName);
    boolean existsByCompanyIdAndIsDeletedFalseAndTemplateNameIgnoreCaseAndIdNot(Long companyId, String templateName, Long id);
    boolean existsByCompanyIdAndIsDeletedFalseAndTypeAndTemplateScope(Long companyId, EmailTemplateType type, EazyTech.EazyHire.models.enums.TemplateScope scope);
}
