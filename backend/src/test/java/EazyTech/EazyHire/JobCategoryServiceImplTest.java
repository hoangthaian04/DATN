package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.ReorderJobCategoriesRequestDTO;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import EazyTech.EazyHire.repositories.JobCategoryRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.impl.JobCategoryServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class JobCategoryServiceImplTest {

    @Mock
    private JobCategoryRepository categoryRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private AuditService audit;

    @InjectMocks
    private JobCategoryServiceImpl service;

    @Test
    void getCategoriesWithoutSearchUsesDedicatedVisibleQuery() {
        JobCategoryEntity category = category(1L, "Technology", "technology");
        when(categoryRepository.findByIsDeletedFalse(any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(category), PageRequest.of(0, 10), 1));
        when(jobRepository.countByCategoryIdAndIsDeletedFalse(1L)).thenReturn(0L);

        var result = service.getCategories(null, 1, 10);

        assertEquals(1, result.getTotalElements());
        assertEquals("Technology", result.getContent().get(0).getName());
        verify(categoryRepository).findByIsDeletedFalse(any(Pageable.class));
        verify(categoryRepository, never()).searchVisible(any(), any(Pageable.class));
    }

    @Test
    void getCategoriesWithSearchNormalizesKeywordAndUsesSearchQuery() {
        JobCategoryEntity category = category(1L, "Technology", "technology");
        when(categoryRepository.searchVisible(eq("tech"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(category), PageRequest.of(0, 10), 1));
        when(jobRepository.countByCategoryIdAndIsDeletedFalse(1L)).thenReturn(0L);

        var result = service.getCategories("  TECH ", 1, 10);

        assertEquals(1, result.getTotalElements());
        verify(categoryRepository).searchVisible(eq("tech"), any(Pageable.class));
        verify(categoryRepository, never()).findByIsDeletedFalse(any(Pageable.class));
    }

    @Test
    void getActiveOptionsExcludesAdminMetricsAndUsesActiveCatalogQuery() {
        JobCategoryEntity category = category(1L, "Technology", "technology");
        when(categoryRepository.findByStatusAndIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc(JobCategoryStatus.ACTIVE))
                .thenReturn(List.of(category));

        var result = service.getActiveOptions();

        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
        assertEquals("Technology", result.get(0).getName());
        verify(jobRepository, never()).countByCategoryIdAndIsDeletedFalse(any());
    }

    @Test
    void deleteCategoryRejectsCategoryUsedByAnyNonDeletedJob() {
        JobCategoryEntity category = category(1L, "Technology", "technology");
        when(categoryRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(category));
        when(jobRepository.countByCategoryIdAndIsDeletedFalse(1L)).thenReturn(1L);

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.deleteCategory(1L, 99L)
        );

        assertEquals(409, exception.getStatusCode());
        verify(categoryRepository, never()).save(any(JobCategoryEntity.class));
        verify(audit, never()).recordGlobal(any(), any(), any(), any(), any());
    }

    @Test
    void deleteCategorySoftDeletesWhenNoNonDeletedJobUsesIt() {
        JobCategoryEntity category = category(1L, "Technology", "technology");
        when(categoryRepository.findByIdAndIsDeletedFalse(1L)).thenReturn(Optional.of(category));
        when(jobRepository.countByCategoryIdAndIsDeletedFalse(1L)).thenReturn(0L);
        when(categoryRepository.save(category)).thenReturn(category);

        service.deleteCategory(1L, 99L);

        assertEquals(true, category.getIsDeleted());
        verify(categoryRepository).save(category);
        verify(audit).recordGlobal(99L, "JOB_CATEGORY", 1L, "DELETE_JOB_CATEGORY", "Xóa mềm danh mục: Technology");
    }

    @Test
    void reorderCategoriesRejectsMissingCategoryId() {
        when(categoryRepository.findByIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc())
                .thenReturn(List.of(
                        category(1L, "Technology", "technology"),
                        category(2L, "Finance", "finance")
                ));
        ReorderJobCategoriesRequestDTO request = reorderRequest(List.of(1L));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.reorderCategories(request, 99L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(categoryRepository, never()).saveAll(any());
    }

    @Test
    void reorderCategoriesRejectsDuplicateCategoryId() {
        when(categoryRepository.findByIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc())
                .thenReturn(List.of(
                        category(1L, "Technology", "technology"),
                        category(2L, "Finance", "finance")
                ));
        ReorderJobCategoriesRequestDTO request = reorderRequest(List.of(1L, 1L, 2L));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.reorderCategories(request, 99L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(categoryRepository, never()).saveAll(any());
    }

    @Test
    void reorderCategoriesRejectsUnknownCategoryId() {
        when(categoryRepository.findByIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc())
                .thenReturn(List.of(
                        category(1L, "Technology", "technology"),
                        category(2L, "Finance", "finance")
                ));
        ReorderJobCategoriesRequestDTO request = reorderRequest(List.of(1L, 3L));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.reorderCategories(request, 99L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(categoryRepository, never()).saveAll(any());
    }

    @Test
    void reorderCategoriesRejectsNullCategoryId() {
        when(categoryRepository.findByIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc())
                .thenReturn(List.of(
                        category(1L, "Technology", "technology"),
                        category(2L, "Finance", "finance")
                ));
        ReorderJobCategoriesRequestDTO request = reorderRequest(Arrays.asList(1L, null));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.reorderCategories(request, 99L)
        );

        assertEquals(400, exception.getStatusCode());
        verify(categoryRepository, never()).saveAll(any());
    }

    @Test
    void reorderCategoriesPersistsContiguousOrderIncludingInactiveCategory() {
        JobCategoryEntity active = category(1L, "Technology", "technology");
        JobCategoryEntity inactive = category(2L, "Finance", "finance");
        inactive.setStatus(JobCategoryStatus.INACTIVE);
        active.setSortOrder(4);
        inactive.setSortOrder(8);
        when(categoryRepository.findByIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc())
                .thenReturn(List.of(active, inactive));
        when(jobRepository.countByCategoryIdAndIsDeletedFalse(1L)).thenReturn(0L);
        when(jobRepository.countByCategoryIdAndIsDeletedFalse(2L)).thenReturn(0L);

        var result = service.reorderCategories(reorderRequest(List.of(2L, 1L)), 99L);

        assertEquals(List.of(2L, 1L), result.stream().map(item -> item.getId()).toList());
        assertEquals(0, inactive.getSortOrder());
        assertEquals(1, active.getSortOrder());
        verify(categoryRepository).saveAll(List.of(active, inactive));
        verify(audit).recordGlobal(99L, "JOB_CATEGORY", null,
                "REORDER_JOB_CATEGORIES", "Cập nhật thứ tự danh mục");
    }

    private ReorderJobCategoriesRequestDTO reorderRequest(List<Long> orderedIds) {
        ReorderJobCategoriesRequestDTO request = new ReorderJobCategoriesRequestDTO();
        request.setOrderedIds(orderedIds);
        return request;
    }

    private JobCategoryEntity category(Long id, String name, String slug) {
        return JobCategoryEntity.builder()
                .id(id)
                .name(name)
                .slug(slug)
                .sortOrder(0)
                .status(JobCategoryStatus.ACTIVE)
                .isDeleted(false)
                .build();
    }
}
