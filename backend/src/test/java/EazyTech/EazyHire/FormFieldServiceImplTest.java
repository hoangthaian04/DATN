package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.FormFieldRequestDTO;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.FormFieldEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.enums.FormFieldType;
import EazyTech.EazyHire.repositories.FormFieldRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.impl.FormFieldServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FormFieldServiceImplTest {

    @Mock
    private FormFieldRepository formFieldRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private FormFieldServiceImpl service;

    @Test
    void createDerivesFieldNameAndStoresSelectOptions() {
        JobEntity job = job(100L, "ACTIVE");
        FormFieldEntity saved = FormFieldEntity.builder()
                .id(10L)
                .job(job)
                .company(job.getCompany())
                .fieldName("kinh_nghiem")
                .label("Kinh nghiệm")
                .fieldType(FormFieldType.SELECT)
                .isRequired(true)
                .options(List.of("1 năm", "2 năm"))
                .orderIndex(0)
                .isDeleted(false)
                .build();

        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(formFieldRepository.existsByJobIdAndFieldNameAndIsDeletedFalse(100L, "kinh_nghiem"))
                .thenReturn(false);
        when(formFieldRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(100L, 1L))
                .thenReturn(List.of());
        when(formFieldRepository.save(any(FormFieldEntity.class))).thenReturn(saved);

        var result = service.createFormField(
                100L,
                1L,
                7L,
                FormFieldRequestDTO.builder()
                        .label("Kinh nghiệm")
                        .fieldType("select")
                        .required(true)
                        .options(List.of("1 năm", "2 năm"))
                        .build()
        );

        assertEquals("kinh_nghiem", result.getFieldName());
        assertEquals("SELECT", result.getFieldType());
        assertEquals(List.of("1 năm", "2 năm"), result.getOptions());
        verify(auditService).recordTarget(eq(7L), eq(1L), eq("FORM_FIELD"), eq(10L), eq("CREATE_FORM_FIELD"), any());
    }

    @Test
    void createRejectsDuplicateSelectOptions() {
        JobEntity job = job(100L, "ACTIVE");
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));

        CustomException exception = assertThrows(CustomException.class, () -> service.createFormField(
                100L,
                1L,
                7L,
                FormFieldRequestDTO.builder()
                        .label("Mức độ")
                        .fieldType("SELECT")
                        .options(List.of("Cao", "Cao"))
                        .build()
        ));

        assertEquals(400, exception.getStatusCode());
        verify(formFieldRepository, never()).save(any());
    }

    @Test
    void formMutationRejectsClosedJob() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job(100L, "CLOSED")));

        CustomException exception = assertThrows(CustomException.class, () -> service.createFormField(
                100L,
                1L,
                7L,
                FormFieldRequestDTO.builder().label("Portfolio").fieldType("URL").build()
        ));

        assertEquals(409, exception.getStatusCode());
        verify(formFieldRepository, never()).save(any());
    }

    @Test
    void reorderRejectsMissingOrDuplicateFieldIds() {
        JobEntity job = job(100L, "ACTIVE");
        FormFieldEntity first = field(10L, job, 0);
        FormFieldEntity second = field(11L, job, 1);
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(formFieldRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(100L, 1L))
                .thenReturn(List.of(first, second));

        CustomException exception = assertThrows(CustomException.class, () -> service.reorderFormFields(
                100L,
                1L,
                7L,
                List.of(10L, 10L)
        ));

        assertEquals(400, exception.getStatusCode());
        verify(formFieldRepository, never()).saveAll(any());
    }

    @Test
    void deleteSoftDeletesFieldAndNormalizesRemainingOrder() {
        JobEntity job = job(100L, "ACTIVE");
        FormFieldEntity field = field(10L, job, 1);
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(formFieldRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(10L, 100L, 1L))
                .thenReturn(Optional.of(field));
        when(formFieldRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAscIdAsc(100L, 1L))
                .thenReturn(List.of());
        when(formFieldRepository.save(any(FormFieldEntity.class))).thenReturn(field);

        service.deleteFormField(100L, 10L, 1L, 7L);

        assertEquals(true, field.getIsDeleted());
        verify(formFieldRepository).save(field);
        verify(formFieldRepository).saveAll(List.of());
        verify(auditService).recordTarget(eq(7L), eq(1L), eq("FORM_FIELD"), eq(10L), eq("DELETE_FORM_FIELD"), any());
    }

    private JobEntity job(Long id, String status) {
        return JobEntity.builder()
                .id(id)
                .company(CompanyEntity.builder().id(1L).name("EasyTech").slug("easytech").build())
                .status(status)
                .isDeleted(false)
                .build();
    }

    private FormFieldEntity field(Long id, JobEntity job, int order) {
        return FormFieldEntity.builder()
                .id(id)
                .job(job)
                .company(job.getCompany())
                .fieldName("field_" + id)
                .label("Field " + id)
                .fieldType(FormFieldType.TEXT)
                .isRequired(false)
                .options(List.of())
                .orderIndex(order)
                .isDeleted(false)
                .build();
    }
}
