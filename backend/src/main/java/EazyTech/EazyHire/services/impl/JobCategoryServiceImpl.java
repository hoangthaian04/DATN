package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.StringUtils;
import EazyTech.EazyHire.models.dtos.CreateJobCategoryRequestDTO;
import EazyTech.EazyHire.models.dtos.JobCategoryResponseDTO;
import EazyTech.EazyHire.models.dtos.JobCategoryOptionResponseDTO;
import EazyTech.EazyHire.models.dtos.ReorderJobCategoriesRequestDTO;
import EazyTech.EazyHire.models.dtos.UpdateJobCategoryRequestDTO;
import EazyTech.EazyHire.models.entities.JobCategoryEntity;
import EazyTech.EazyHire.models.enums.JobCategoryStatus;
import EazyTech.EazyHire.repositories.JobCategoryRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.JobCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class JobCategoryServiceImpl implements JobCategoryService {

    private final JobCategoryRepository categoryRepository;
    private final JobRepository jobRepository;
    private final AuditService audit;

    @Override
    @Transactional(readOnly = true)
    public List<JobCategoryOptionResponseDTO> getActiveOptions() {
        return categoryRepository
                .findByStatusAndIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc(JobCategoryStatus.ACTIVE)
                .stream()
                .map(category -> JobCategoryOptionResponseDTO.builder()
                        .id(category.getId())
                        .name(category.getName())
                        .slug(category.getSlug())
                        .build())
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<JobCategoryResponseDTO> getCategories(String search, int page, int size) {
        int pageNumber = Math.max(page - 1, 0);
        int pageSize = size > 0 ? Math.min(size, 100) : 10;
        String normalizedSearch = search == null || search.isBlank()
                ? null
                : search.trim().toLowerCase();
        Pageable pageable = PageRequest.of(
                pageNumber,
                pageSize,
                Sort.by(Sort.Order.asc("sortOrder"), Sort.Order.asc("createdAt"), Sort.Order.asc("id"))
        );
        Page<JobCategoryEntity> categories = normalizedSearch == null
                ? categoryRepository.findByIsDeletedFalse(pageable)
                : categoryRepository.searchVisible(normalizedSearch, pageable);
        return categories.map(this::toResponse);
    }

    @Override
    @Transactional
    public JobCategoryResponseDTO createCategory(CreateJobCategoryRequestDTO request, Long adminId) {
        String name = normalizeName(request.getName());
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new CustomException(409, "Tên danh mục này đã tồn tại trong hệ thống.");
        }

        JobCategoryEntity category = JobCategoryEntity.builder()
                .name(name)
                .slug(uniqueSlug(name, null))
                .status(JobCategoryStatus.ACTIVE)
                .isDeleted(false)
                .sortOrder(nextSortOrder())
                .build();
        JobCategoryEntity saved = categoryRepository.save(category);
        audit.recordGlobal(adminId, "JOB_CATEGORY", saved.getId(), "CREATE_JOB_CATEGORY", "Tạo danh mục: " + saved.getName());
        return toResponse(saved);
    }

    @Override
    @Transactional
    public JobCategoryResponseDTO updateCategory(Long id, UpdateJobCategoryRequestDTO request, Long adminId) {
        JobCategoryEntity category = getVisibleCategory(id);
        boolean hasName = request.getName() != null;
        boolean hasStatus = request.getStatus() != null;
        if (!hasName && !hasStatus) {
            throw new CustomException(400, "Cần cung cấp tên hoặc trạng thái danh mục để cập nhật.");
        }

        String oldName = category.getName();
        JobCategoryStatus oldStatus = category.getStatus();
        if (hasName) {
            String name = normalizeName(request.getName());
            if (categoryRepository.existsByNameIgnoreCaseAndIdNot(name, id)) {
                throw new CustomException(409, "Tên danh mục này đã tồn tại trong hệ thống.");
            }
            category.setName(name);
            category.setSlug(uniqueSlug(name, id));
        }
        if (hasStatus) {
            category.setStatus(request.getStatus());
        }

        JobCategoryEntity saved = categoryRepository.save(category);
        String detail = "Cập nhật danh mục từ name=" + oldName + ", status=" + oldStatus
                + " thành name=" + saved.getName() + ", status=" + saved.getStatus();
        audit.recordGlobal(adminId, "JOB_CATEGORY", saved.getId(), "UPDATE_JOB_CATEGORY", detail);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id, Long adminId) {
        JobCategoryEntity category = getVisibleCategory(id);
        long jobCount = jobRepository.countByCategoryIdAndIsDeletedFalse(id);
        if (jobCount > 0) {
            throw new CustomException(409, "Không thể xóa danh mục đang có Job sử dụng.");
        }

        category.setIsDeleted(true);
        categoryRepository.save(category);
        audit.recordGlobal(adminId, "JOB_CATEGORY", id, "DELETE_JOB_CATEGORY", "Xóa mềm danh mục: " + category.getName());
    }

    @Override
    @Transactional
    public List<JobCategoryResponseDTO> reorderCategories(ReorderJobCategoriesRequestDTO request, Long adminId) {
        List<JobCategoryEntity> categories = categoryRepository.findByIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc();
        Set<Long> expectedIds = new HashSet<>(categories.stream().map(JobCategoryEntity::getId).toList());
        Set<Long> submittedIds = new HashSet<>(request.getOrderedIds());
        if (request.getOrderedIds().size() != submittedIds.size() || !expectedIds.equals(submittedIds)) {
            throw new CustomException(400, "Danh sách thứ tự danh mục không hợp lệ.");
        }

        Map<Long, JobCategoryEntity> byId = new HashMap<>();
        categories.forEach(category -> byId.put(category.getId(), category));
        for (int index = 0; index < request.getOrderedIds().size(); index++) {
            byId.get(request.getOrderedIds().get(index)).setSortOrder(index);
        }
        categoryRepository.saveAll(categories);
        audit.recordGlobal(adminId, "JOB_CATEGORY", null, "REORDER_JOB_CATEGORIES", "Cập nhật thứ tự danh mục");
        return request.getOrderedIds().stream().map(byId::get).map(this::toResponse).toList();
    }

    private JobCategoryEntity getVisibleCategory(Long id) {
        return categoryRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy danh mục ngành nghề."));
    }

    private String normalizeName(String name) {
        if (name == null || name.isBlank()) {
            throw new CustomException(400, "Tên danh mục không được để trống.");
        }
        return name.trim();
    }

    private String uniqueSlug(String name, Long currentId) {
        String base = StringUtils.toSlug(name);
        if (base.isBlank()) {
            throw new CustomException(400, "Không thể tạo slug từ tên danh mục.");
        }
        String candidate = base;
        int suffix = 2;
        while (currentId == null
                ? categoryRepository.existsBySlug(candidate)
                : categoryRepository.existsBySlugAndIdNot(candidate, currentId)) {
            candidate = base + "-" + suffix++;
        }
        return candidate;
    }

    private int nextSortOrder() {
        return categoryRepository.findByIsDeletedFalseOrderBySortOrderAscCreatedAtAscIdAsc()
                .stream()
                .map(JobCategoryEntity::getSortOrder)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .max()
                .orElse(-1) + 1;
    }

    private JobCategoryResponseDTO toResponse(JobCategoryEntity category) {
        return JobCategoryResponseDTO.builder()
                .id(category.getId())
                .name(category.getName())
                .slug(category.getSlug())
                .sortOrder(category.getSortOrder())
                .status(category.getStatus())
                .jobCount(jobRepository.countByCategoryIdAndIsDeletedFalse(category.getId()))
                .createdAt(category.getCreatedAt())
                .build();
    }
}
