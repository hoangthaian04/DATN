package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.entities.AiMatchingRunEntity;
import EazyTech.EazyHire.models.enums.AiMatchingRunStatus;
import EazyTech.EazyHire.repositories.AiMatchingRunRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiMatchingRunQueueService {

    private final AiMatchingRunRepository runRepository;

    @Value("${ai.matching.lease-seconds:120}")
    private long leaseSeconds;

    @Transactional(readOnly = true)
    public List<Long> queuedRunIds() {
        return runRepository.findQueuedRunIds(PageRequest.of(0, 5));
    }

    @Transactional(readOnly = true)
    public Optional<AiMatchingRunEntity> activeRun(Long jobId, Long companyId) {
        return runRepository.findFirstByJobIdAndCompanyIdAndStatusInOrderByCreatedAtDesc(
                jobId,
                companyId,
                List.of(AiMatchingRunStatus.QUEUED, AiMatchingRunStatus.PROCESSING)
        );
    }

    @Transactional
    public AiMatchingRunEntity enqueue(AiMatchingRunEntity run) {
        Optional<AiMatchingRunEntity> active = activeRun(run.getJobId(), run.getCompanyId());
        return active.orElseGet(() -> runRepository.save(run));
    }

    @Transactional
    public boolean claim(Long runId) {
        LocalDateTime now = LocalDateTime.now();
        return runRepository.claimQueuedRun(runId, now, now.plusSeconds(Math.max(30, leaseSeconds))) == 1;
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void renewLease(Long runId) {
        runRepository.renewLease(runId, LocalDateTime.now().plusSeconds(Math.max(30, leaseSeconds)));
    }

    @Transactional
    public int requeueExpiredRuns() {
        return runRepository.requeueExpiredRuns(LocalDateTime.now());
    }

    @Transactional
    public void markFailed(Long runId, String message) {
        runRepository.findById(runId).ifPresent(run -> {
            if (run.getStatus() == AiMatchingRunStatus.COMPLETED) return;
            run.setStatus(AiMatchingRunStatus.FAILED);
            run.setErrorMessage(message);
            run.setLeaseUntil(null);
            run.setCompletedAt(LocalDateTime.now());
        });
    }
}
