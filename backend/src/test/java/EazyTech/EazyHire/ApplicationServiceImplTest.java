package EazyTech.EazyHire;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.CvFileContent;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.models.entities.ApplicationEntity;
import EazyTech.EazyHire.services.CvStorageService;
import EazyTech.EazyHire.services.impl.ApplicationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceImplTest {

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private CvStorageService cvStorageService;

    @InjectMocks
    private ApplicationServiceImpl service;

    @Test
    void normalizesCanonicalStatusAndPassesKeywordToRepository() {
        when(jobRepository.existsByIdAndCompanyId(10L, 20L)).thenReturn(true);
        when(applicationRepository.findApplicationsForListView(
                eq(10L), eq(20L), eq("ACTIVE"), eq("tran"), any(Pageable.class)))
                .thenReturn(Page.empty());

        service.getApplicationsForJob(
                20L,
                10L,
                " active ",
                " tran ",
                new PaginationRequest(10, 1, null, null)
        );

        verify(applicationRepository).findApplicationsForListView(
                eq(10L), eq(20L), eq("ACTIVE"), eq("tran"), any(Pageable.class));
    }

    @Test
    void rejectsUnknownApplicationStatusBeforeQueryingRepository() {
        when(jobRepository.existsByIdAndCompanyId(10L, 20L)).thenReturn(true);

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.getApplicationsForJob(
                        20L,
                        10L,
                        "PASSED",
                        null,
                        new PaginationRequest(10, 1, null, null)
                )
        );

        assertEquals(400, exception.getStatusCode());
        verify(applicationRepository, never())
                .findApplicationsForListView(any(), any(), any(), any(), any(Pageable.class));
    }

    @Test
    void returnsPrivateCvContentForApplicationOwnedByCompany() {
        ApplicationEntity application = ApplicationEntity.builder()
                .id(301L)
                .cvUrl("private://candidate-cvs/20/10/cv.pdf")
                .build();
        byte[] pdf = "%PDF-test".getBytes();
        when(applicationRepository.findByIdAndCompanyIdWithContext(301L, 20L)).thenReturn(java.util.Optional.of(application));
        when(cvStorageService.read(application.getCvUrl())).thenReturn(pdf);

        CvFileContent result = service.getCv(301L, 20L);

        assertArrayEquals(pdf, result.content());
        assertEquals("cv-301.pdf", result.filename());
        verify(cvStorageService).read(application.getCvUrl());
    }

    @Test
    void rejectsApplicationWithoutCvBeforeReadingStorage() {
        ApplicationEntity application = ApplicationEntity.builder().id(301L).build();
        when(applicationRepository.findByIdAndCompanyIdWithContext(301L, 20L)).thenReturn(java.util.Optional.of(application));

        CustomException exception = assertThrows(CustomException.class, () -> service.getCv(301L, 20L));

        assertEquals(404, exception.getStatusCode());
        verify(cvStorageService, never()).read(any());
    }

    @Test
    void hidesApplicationOutsideCurrentCompany() {
        when(applicationRepository.findByIdAndCompanyIdWithContext(301L, 20L)).thenReturn(java.util.Optional.empty());

        CustomException exception = assertThrows(CustomException.class, () -> service.getCv(301L, 20L));

        assertEquals(404, exception.getStatusCode());
        verify(cvStorageService, never()).read(any());
    }
}
