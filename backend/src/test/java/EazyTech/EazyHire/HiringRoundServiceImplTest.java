package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.HiringRoundRequestDTO;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.UserAccountService;
import EazyTech.EazyHire.services.impl.HiringRoundServiceImpl;
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class HiringRoundServiceImplTest {

    @Mock
    private HiringRoundRepository hiringRoundRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private UserAccountService accounts;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private HiringRoundServiceImpl service;

    @BeforeEach
    void stubActiveWorkspace() {
        UserEntity user = UserEntity.builder()
                .id(1L)
                .company(CompanyEntity.builder().id(1L).build())
                .status(UserStatus.ACTIVE)
                .build();
        lenient().when(accounts.requireHr(eq(1L), eq(true))).thenReturn(user);
    }

    @Test
    void createRoundAppendsRoundAndSynchronizesJobRoundCount() {
        JobEntity job = job(100L, "ACTIVE");
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.countByJobIdAndCompanyIdAndIsDeletedFalse(100L, 1L)).thenReturn(1L);
        when(hiringRoundRepository.save(any(HiringRoundEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        var result = service.createRound(
                100L,
                1L,
                1L,
                HiringRoundRequestDTO.builder()
                        .name("Technical Interview")
                        .passEmailTemplateId(301L)
                        .failEmailTemplateId(302L)
                        .build()
        );

        assertEquals("Technical Interview", result.getName());
        assertEquals(1, result.getOrderIndex());
        assertEquals(2, job.getRoundCount());
        verify(jobRepository).save(job);
        verify(auditService).recordTarget(1L, 1L, "HIRING_ROUND", null, "CREATE_HIRING_ROUND", "Tạo vòng tuyển dụng: Technical Interview");
    }

    @Test
    void updateRoundChangesEditableFieldsWithoutChangingOrder() {
        JobEntity job = job(100L, "ACTIVE");
        HiringRoundEntity round = round(10L, job, 1);
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(10L, 100L, 1L))
                .thenReturn(Optional.of(round));
        when(hiringRoundRepository.save(round)).thenReturn(round);

        var result = service.updateRound(
                100L,
                10L,
                1L,
                1L,
                HiringRoundRequestDTO.builder()
                        .name("Updated interview")
                        .description("Updated description")
                        .isFinalRound(true)
                        .build()
        );

        assertEquals("Updated interview", result.getName());
        assertEquals("Updated description", result.getDescription());
        assertEquals(1, result.getOrderIndex());
        assertEquals(true, result.getIsFinalRound());
        verify(hiringRoundRepository).save(round);
    }

    @Test
    void deleteRoundRejectsRoundWithCurrentApplicants() {
        JobEntity job = job(100L, "ACTIVE");
        HiringRoundEntity round = round(10L, job, 0);
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(10L, 100L, 1L))
                .thenReturn(Optional.of(round));
        when(applicationRepository.existsByJobIdAndCurrentRoundId(100L, 10L)).thenReturn(true);

        CustomException exception = assertThrows(
                CustomException.class,
            () -> service.deleteRound(100L, 10L, 1L, 1L)
        );

        assertEquals(400, exception.getStatusCode());
        assertEquals("Vòng này đang có ứng viên. Bạn cần chuyển họ sang vòng khác trước khi xóa.", exception.getMessage());
        verify(hiringRoundRepository, never()).save(round);
        verify(jobRepository, never()).save(job);
    }

    @Test
    void deleteRoundSoftDeletesAndNormalizesRemainingOrder() {
        JobEntity job = job(100L, "ACTIVE");
        HiringRoundEntity deleted = round(10L, job, 0);
        HiringRoundEntity remaining = round(11L, job, 2);
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(10L, 100L, 1L))
                .thenReturn(Optional.of(deleted));
        when(applicationRepository.existsByJobIdAndCurrentRoundId(100L, 10L)).thenReturn(false);
        when(hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(100L, 1L))
                .thenReturn(List.of(remaining));
        when(hiringRoundRepository.countByJobIdAndCompanyIdAndIsDeletedFalse(100L, 1L)).thenReturn(1L);
        when(hiringRoundRepository.save(any(HiringRoundEntity.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        service.deleteRound(100L, 10L, 1L, 1L);

        assertEquals(true, deleted.getIsDeleted());
        assertEquals(0, remaining.getOrderIndex());
        assertEquals(1, job.getRoundCount());
        verify(hiringRoundRepository).save(deleted);
        verify(hiringRoundRepository).saveAll(List.of(remaining));
        verify(jobRepository).save(job);
    }

    @Test
    void reorderRoundsRequiresEveryActiveRoundExactlyOnce() {
        JobEntity job = job(100L, "ACTIVE");
        HiringRoundEntity first = round(10L, job, 0);
        HiringRoundEntity second = round(11L, job, 1);
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(100L, 1L))
                .thenReturn(List.of(first, second));

        CustomException exception = assertThrows(
                CustomException.class,
            () -> service.reorderRounds(100L, 1L, 1L, List.of(10L, 10L))
        );

        assertEquals(400, exception.getStatusCode());
        verify(hiringRoundRepository, never()).saveAll(any());
    }

    @Test
    void reorderRoundsUpdatesOrderUsingLongIds() {
        JobEntity job = job(100L, "ACTIVE");
        HiringRoundEntity first = round(10L, job, 0);
        HiringRoundEntity second = round(11L, job, 1);
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job));
        when(hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(100L, 1L))
                .thenReturn(List.of(first, second));

        var result = service.reorderRounds(100L, 1L, 1L, List.of(11L, 10L));

        assertEquals(List.of(11L, 10L), result.stream().map(item -> item.getId()).toList());
        assertEquals(1, first.getOrderIndex());
        assertEquals(0, second.getOrderIndex());
        verify(hiringRoundRepository).saveAll(List.of(first, second));
        verify(auditService).recordTarget(1L, 1L, "JOB", 100L, "REORDER_HIRING_ROUNDS", "Cập nhật thứ tự vòng tuyển dụng");
    }

    @Test
    void roundMutationRejectsClosedJob() {
        when(jobRepository.findById(100L)).thenReturn(Optional.of(job(100L, "CLOSED")));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.createRound(
                        100L,
                    1L,
                    1L,
                    HiringRoundRequestDTO.builder().name("Interview").build()
                )
        );

        assertEquals(409, exception.getStatusCode());
        verify(hiringRoundRepository, never()).save(any(HiringRoundEntity.class));
    }

    @Test
    void getRoundsRejectsJobFromAnotherCompanyWithoutLeakingIt() {
        JobEntity foreignJob = JobEntity.builder()
                .id(100L)
                .company(CompanyEntity.builder().id(2L).build())
                .isDeleted(false)
                .status("ACTIVE")
                .build();
        when(jobRepository.findById(100L)).thenReturn(Optional.of(foreignJob));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.getRounds(100L, 1L, 1L)
        );

        assertEquals(404, exception.getStatusCode());
        verify(hiringRoundRepository, never()).findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(100L, 1L);
    }

    @Test
    void roundAccessRequiresActiveHrWorkspace() {
        when(accounts.requireHr(1L, true)).thenThrow(new CustomException(403, "Workspace bị khóa"));

        CustomException exception = assertThrows(
                CustomException.class,
                () -> service.getRounds(100L, 1L, 1L)
        );

        assertEquals(403, exception.getStatusCode());
        verify(jobRepository, never()).findById(100L);
    }

    private JobEntity job(Long id, String status) {
        return JobEntity.builder()
                .id(id)
                .company(CompanyEntity.builder().id(1L).name("EasyTech").build())
                .status(status)
                .isDeleted(false)
                .roundCount(0)
                .build();
    }

    private HiringRoundEntity round(Long id, JobEntity job, int orderIndex) {
        return HiringRoundEntity.builder()
                .id(id)
                .job(job)
                .company(job.getCompany())
                .name("Round " + id)
                .orderIndex(orderIndex)
                .isFinalRound(false)
                .isDeleted(false)
                .build();
    }
}
