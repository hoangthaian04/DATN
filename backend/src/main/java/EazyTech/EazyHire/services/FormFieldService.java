package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.FormFieldRequestDTO;
import EazyTech.EazyHire.models.dtos.FormFieldResponseDTO;

import java.util.List;

public interface FormFieldService {

    List<FormFieldResponseDTO> getFormFields(Long jobId, Long companyId);

    FormFieldResponseDTO createFormField(Long jobId, Long companyId, Long actorId, FormFieldRequestDTO request);

    FormFieldResponseDTO updateFormField(
            Long jobId,
            Long fieldId,
            Long companyId,
            Long actorId,
            FormFieldRequestDTO request
    );

    void deleteFormField(Long jobId, Long fieldId, Long companyId, Long actorId);

    List<FormFieldResponseDTO> reorderFormFields(Long jobId, Long companyId, Long actorId, List<Long> orderedIds);
}
