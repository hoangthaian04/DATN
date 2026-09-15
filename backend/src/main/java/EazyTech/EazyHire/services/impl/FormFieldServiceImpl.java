package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.FormFieldRequestDTO;
import EazyTech.EazyHire.models.dtos.FormFieldResponseDTO;
import EazyTech.EazyHire.models.entities.FormFieldEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.enums.FormFieldType;
import EazyTech.EazyHire.repositories.FormFieldRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.FormFieldService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class FormFieldServiceImpl implements FormFieldService {

    private final FormFieldRepository formFieldRepository;
    private final JobRepository jobRepository;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public List<FormFieldResponseDTO> getFormFields(Long jobId, Long companyId) {
        getAccessibleJob(jobId, companyId);
        return formFieldRepository
                .findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(jobId, companyId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public FormFieldResponseDTO createFormField(Long jobId, Long companyId, Long actorId, FormFieldRequestDTO request) {
        JobEntity job = getEditableJob(jobId, companyId);
        FormFieldType fieldType = parseFieldType(request.getFieldType());
        List<String> options = normalizeOptions(fieldType, request.getOptions());
        String fieldName = resolveFieldName(request.getFieldName(), request.getLabel());
        ensureFieldNameAvailable(jobId, fieldName, null);

        FormFieldEntity field = FormFieldEntity.builder()
                .company(job.getCompany())
                .job(job)
                .fieldName(fieldName)
                .label(request.getLabel().trim())
                .fieldType(fieldType)
                .isRequired(Boolean.TRUE.equals(request.getRequired()))
                .options(options)
                .orderIndex(request.getDisplayOrder() != null
                        ? request.getDisplayOrder()
                        : nextOrder(jobId, companyId))
                .isDeleted(false)
                .build();

        FormFieldEntity saved = formFieldRepository.save(field);
        auditService.recordTarget(
                actorId,
                companyId,
                "FORM_FIELD",
                saved.getId(),
                "CREATE_FORM_FIELD",
                "Tạo field form: " + saved.getLabel()
        );
        return toResponse(saved);
    }

    @Override
    @Transactional
    public FormFieldResponseDTO updateFormField(
            Long jobId,
            Long fieldId,
            Long companyId,
            Long actorId,
            FormFieldRequestDTO request
    ) {
        getEditableJob(jobId, companyId);
        FormFieldEntity field = getField(jobId, fieldId, companyId);
        FormFieldType fieldType = parseFieldType(request.getFieldType());
        List<String> options = normalizeOptions(fieldType, request.getOptions());
        String fieldName = request.getFieldName() == null || request.getFieldName().isBlank()
                ? field.getFieldName()
                : resolveFieldName(request.getFieldName(), request.getLabel());
        ensureFieldNameAvailable(jobId, fieldName, fieldId);

        field.setFieldName(fieldName);
        field.setLabel(request.getLabel().trim());
        field.setFieldType(fieldType);
        field.setIsRequired(Boolean.TRUE.equals(request.getRequired()));
        field.setOptions(options);
        if (request.getDisplayOrder() != null) field.setOrderIndex(request.getDisplayOrder());

        FormFieldEntity saved = formFieldRepository.save(field);
        auditService.recordTarget(
                actorId,
                companyId,
                "FORM_FIELD",
                saved.getId(),
                "UPDATE_FORM_FIELD",
                "Cập nhật field form: " + saved.getLabel()
        );
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteFormField(Long jobId, Long fieldId, Long companyId, Long actorId) {
        getEditableJob(jobId, companyId);
        FormFieldEntity field = getField(jobId, fieldId, companyId);
        field.setIsDeleted(true);
        formFieldRepository.save(field);
        normalizeOrder(jobId, companyId);
        auditService.recordTarget(
                actorId,
                companyId,
                "FORM_FIELD",
                fieldId,
                "DELETE_FORM_FIELD",
                "Xóa mềm field form: " + field.getLabel()
        );
    }

    @Override
    @Transactional
    public List<FormFieldResponseDTO> reorderFormFields(Long jobId, Long companyId, Long actorId, List<Long> orderedIds) {
        getEditableJob(jobId, companyId);
        List<FormFieldEntity> fields = formFieldRepository
                .findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(jobId, companyId);
        Set<Long> expectedIds = new HashSet<>(fields.stream().map(FormFieldEntity::getId).toList());
        Set<Long> submittedIds = new HashSet<>(orderedIds);
        if (orderedIds.size() != submittedIds.size() || !expectedIds.equals(submittedIds)) {
            throw new CustomException(400, "Danh sách thứ tự field không hợp lệ");
        }

        Map<Long, FormFieldEntity> byId = new HashMap<>();
        fields.forEach(field -> byId.put(field.getId(), field));
        for (int index = 0; index < orderedIds.size(); index++) {
            byId.get(orderedIds.get(index)).setOrderIndex(index);
        }
        formFieldRepository.saveAll(fields);
        auditService.recordTarget(
                actorId,
                companyId,
                "JOB",
                jobId,
                "REORDER_FORM_FIELDS",
                "Cập nhật thứ tự field form"
        );
        return orderedIds.stream().map(byId::get).map(this::toResponse).toList();
    }

    private JobEntity getAccessibleJob(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));
        if (job.getCompany() == null || !job.getCompany().getId().equals(companyId)) {
            throw new CustomException(403, "Bạn không có quyền truy cập Job này");
        }
        if (Boolean.TRUE.equals(job.getIsDeleted())) {
            throw new CustomException(404, "Job này đã bị xóa");
        }
        return job;
    }

    private JobEntity getEditableJob(Long jobId, Long companyId) {
        JobEntity job = getAccessibleJob(jobId, companyId);
        if ("CLOSED".equals(job.getStatus())) {
            throw new CustomException(409, "Job đã CLOSED, không thể chỉnh sửa form ứng tuyển");
        }
        return job;
    }

    private FormFieldEntity getField(Long jobId, Long fieldId, Long companyId) {
        return formFieldRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(fieldId, jobId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy field form"));
    }

    private FormFieldType parseFieldType(String value) {
        try {
            return FormFieldType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (Exception exception) {
            throw new CustomException(400, "Loại field không hợp lệ. Chọn TEXT, TEXTAREA, URL, FILE hoặc SELECT");
        }
    }

    private List<String> normalizeOptions(FormFieldType fieldType, List<String> options) {
        List<String> normalized = options == null
                ? List.of()
                : options.stream()
                .map(option -> option == null ? "" : option.trim())
                .toList();
        if (fieldType != FormFieldType.SELECT) {
            if (!normalized.isEmpty()) {
                throw new CustomException(400, "Chỉ field SELECT mới được có options");
            }
            return List.of();
        }
        if (normalized.isEmpty() || normalized.stream().anyMatch(String::isBlank)) {
            throw new CustomException(400, "Field SELECT phải có ít nhất một lựa chọn hợp lệ");
        }
        if (new HashSet<>(normalized).size() != normalized.size()) {
            throw new CustomException(400, "Các lựa chọn của field SELECT không được trùng nhau");
        }
        return normalized;
    }

    private String resolveFieldName(String requestedName, String label) {
        String value = requestedName == null || requestedName.isBlank()
                ? toFieldName(label)
                : requestedName.trim();
        if (!value.matches("[A-Za-z][A-Za-z0-9_]{0,254}")) {
            throw new CustomException(400, "fieldName chỉ được gồm chữ, số, dấu gạch dưới và bắt đầu bằng chữ");
        }
        return value;
    }

    private String toFieldName(String label) {
        String normalized = Normalizer.normalize(label.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^A-Za-z0-9]+", "_")
                .replaceAll("^_+|_+$", "")
                .toLowerCase(Locale.ROOT);
        if (normalized.isBlank()) {
            throw new CustomException(400, "Không thể tạo fieldName từ nhãn field");
        }
        if (!Character.isLetter(normalized.charAt(0))) normalized = "field_" + normalized;
        return normalized;
    }

    private void ensureFieldNameAvailable(Long jobId, String fieldName, Long currentId) {
        boolean exists = currentId == null
                ? formFieldRepository.existsByJobIdAndFieldNameAndIsDeletedFalse(jobId, fieldName)
                : formFieldRepository.existsByJobIdAndFieldNameAndIdNotAndIsDeletedFalse(jobId, fieldName, currentId);
        if (exists) throw new CustomException(409, "fieldName đã được sử dụng trong Job này");
    }

    private int nextOrder(Long jobId, Long companyId) {
        return formFieldRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(jobId, companyId)
                .stream()
                .map(FormFieldEntity::getOrderIndex)
                .filter(java.util.Objects::nonNull)
                .mapToInt(Integer::intValue)
                .max()
                .orElse(-1) + 1;
    }

    private void normalizeOrder(Long jobId, Long companyId) {
        List<FormFieldEntity> fields = formFieldRepository
                .findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(jobId, companyId);
        for (int index = 0; index < fields.size(); index++) fields.get(index).setOrderIndex(index);
        formFieldRepository.saveAll(fields);
    }

    private FormFieldResponseDTO toResponse(FormFieldEntity field) {
        return FormFieldResponseDTO.builder()
                .id(field.getId())
                .jobId(field.getJob().getId())
                .fieldName(field.getFieldName())
                .label(field.getLabel())
                .fieldType(field.getFieldType().name())
                .required(Boolean.TRUE.equals(field.getIsRequired()))
                .options(field.getOptions() == null ? List.of() : field.getOptions())
                .displayOrder(field.getOrderIndex())
                .createdAt(field.getCreatedAt())
                .updatedAt(field.getUpdatedAt())
                .build();
    }
}
