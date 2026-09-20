package EazyTech.EazyHire;

import EazyTech.EazyHire.core.PaginationRequest;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.impl.ApplicationServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import static org.junit.jupiter.api.Assertions.assertEquals;
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
}
