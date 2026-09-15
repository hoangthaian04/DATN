package EazyTech.EazyHire.repositories;

import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface JobCategoryRepository extends JpaRepository<JobCategoryEntity, Long> {

    @Query("""
            SELECT c FROM JobCategoryEntity c
            WHERE c.isDeleted = false
              AND (LOWER(c.name) LIKE CONCAT('%', :search, '%')
                   OR LOWER(c.slug) LIKE CONCAT('%', :search, '%'))
            """)
    Page<JobCategoryEntity> searchVisible(
            @Param("search") String search,
            Pageable pageable
    );

    Page<JobCategoryEntity> findByIsDeletedFalse(Pageable pageable);

    Optional<JobCategoryEntity> findByIdAndIsDeletedFalse(Long id);

    List<JobCategoryEntity> findByIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc();

    List<JobCategoryEntity> findByStatusAndIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc(
            JobCategoryStatus status
    );

    Optional<JobCategoryEntity> findByIdAndStatusAndIsDeletedFalse(Long id, JobCategoryStatus status);

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
