package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.HiringRoundDTO;
import EazyTech.EazyHire.models.dtos.HiringRoundRequestDTO;
import java.util.List;

public interface HiringRoundService {
    List<HiringRoundDTO> getRounds(Long jobId, Long companyId, Long userId);
    HiringRoundDTO createRound(Long jobId, Long companyId, Long userId, HiringRoundRequestDTO request);
    HiringRoundDTO updateRound(Long jobId, Long roundId, Long companyId, Long userId, HiringRoundRequestDTO request);
    void deleteRound(Long jobId, Long roundId, Long companyId, Long userId);
    List<HiringRoundDTO> reorderRounds(Long jobId, Long companyId, Long userId, List<Long> orderedIds);
}
