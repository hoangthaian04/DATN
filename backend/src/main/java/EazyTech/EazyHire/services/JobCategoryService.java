package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.CreateJobCategoryRequestDTO;
import EazyTech.EazyHire.models.dtos.JobCategoryResponseDTO;
import EazyTech.EazyHire.models.dtos.JobCategoryOptionResponseDTO;
import EazyTech.EazyHire.models.dtos.ReorderJobCategoriesRequestDTO;
import EazyTech.EazyHire.models.dtos.UpdateJobCategoryRequestDTO;
import org.springframework.data.domain.Page;

public interface JobCategoryService {
    java.util.List<JobCategoryOptionResponseDTO> getActiveOptions();

    Page<JobCategoryResponseDTO> getCategories(String search, int page, int size);

    JobCategoryResponseDTO createCategory(CreateJobCategoryRequestDTO request, Long adminId);

    JobCategoryResponseDTO updateCategory(Long id, UpdateJobCategoryRequestDTO request, Long adminId);

    void deleteCategory(Long id, Long adminId);

    java.util.List<JobCategoryResponseDTO> reorderCategories(ReorderJobCategoriesRequestDTO request, Long adminId);
}
