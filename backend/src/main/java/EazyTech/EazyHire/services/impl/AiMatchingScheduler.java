package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.services.AiMatchingRunQueueService;
import EazyTech.EazyHire.core.exceptions.CustomException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class AiMatchingScheduler {

    private static final String SAFE_FAILURE = "Không thể hoàn tất AI Match. Kiểm tra cấu hình AI/provider rồi chạy lại.";

    private final AiMatchingRunQueueService queueService;
    private final AiMatchingProcessor processor;

    @Scheduled(fixedDelayString = "${ai.matching.poll-interval-ms:2000}")
    public void processQueuedRuns() {
        try {
            queueService.requeueExpiredRuns();
            for (Long runId : queueService.queuedRunIds()) {
                if (!queueService.claim(runId)) continue;
                try {
                    processor.process(runId);
                } catch (Exception exception) {
                    String message = exception instanceof CustomException customException
                            ? customException.getMessage()
                            : SAFE_FAILURE;
                    log.error("AI matching run failed: runId={}, message={}", runId, message, exception);
                    queueService.markFailed(runId, message);
                }
                break;
            }
        } catch (Exception exception) {
            log.error("AI matching queue polling failed", exception);
        }
    }
}
