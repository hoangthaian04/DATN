package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.HiringRoundDTO;
import EazyTech.EazyHire.models.dtos.HiringRoundRequestDTO;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.HiringRoundService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class HiringRoundServiceImpl implements HiringRoundService {
    private final HiringRoundRepository hiringRoundRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HiringRoundDTO> getRounds(Long jobId, Long companyId) {
        getAccessibleJob(jobId, companyId);
        return hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(jobId, companyId)
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public HiringRoundDTO createRound(Long jobId, Long companyId, HiringRoundRequestDTO request) {
        JobEntity job = getAccessibleJob(jobId, companyId);
        int nextOrder = (int) hiringRoundRepository.countByJobIdAndCompanyIdAndIsDeletedFalse(jobId, companyId);
        HiringRoundEntity round = HiringRoundEntity.builder()
                .company(job.getCompany()).job(job).name(request.getName().trim())
                .description(request.getDescription()).orderIndex(nextOrder)
                .passEmailTemplateId(request.getPassEmailTemplateId()).failEmailTemplateId(request.getFailEmailTemplateId())
                .testLink(request.getTestLink()).isFinalRound(Boolean.TRUE.equals(request.getIsFinalRound())).build();
        HiringRoundEntity saved = hiringRoundRepository.save(round);
        syncRoundCount(job, nextOrder + 1);
        return toDto(saved);
    }

    @Override
    @Transactional
    public HiringRoundDTO updateRound(Long jobId, Long roundId, Long companyId, HiringRoundRequestDTO request) {
        getAccessibleJob(jobId, companyId);
        HiringRoundEntity round = getRound(roundId, jobId, companyId);
        round.setName(request.getName().trim());
        round.setDescription(request.getDescription());
        round.setPassEmailTemplateId(request.getPassEmailTemplateId());
        round.setFailEmailTemplateId(request.getFailEmailTemplateId());
        round.setTestLink(request.getTestLink());
        round.setIsFinalRound(Boolean.TRUE.equals(request.getIsFinalRound()));
        return toDto(hiringRoundRepository.save(round));
    }

    @Override
    @Transactional
    public void deleteRound(Long jobId, Long roundId, Long companyId) {
        JobEntity job = getAccessibleJob(jobId, companyId);
        HiringRoundEntity round = getRound(roundId, jobId, companyId);
        if (applicationRepository.existsByJobIdAndCurrentRoundId(jobId, roundId)) {
            throw new CustomException(400, "Không thể xóa vòng phỏng vấn đang có ứng viên");
        }
        round.setIsDeleted(true);
        hiringRoundRepository.save(round);
        normalizeOrder(jobId, companyId);
        syncRoundCount(job, (int) hiringRoundRepository.countByJobIdAndCompanyIdAndIsDeletedFalse(jobId, companyId));
    }

    @Override
    @Transactional
    public List<HiringRoundDTO> reorderRounds(Long jobId, Long companyId, List<Long> orderedIds) {
        getAccessibleJob(jobId, companyId);
        List<HiringRoundEntity> rounds = hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(jobId, companyId);
        Set<Long> expectedIds = new HashSet<>(rounds.stream().map(HiringRoundEntity::getId).toList());
        Set<Long> submittedIds = new HashSet<>(orderedIds);
        if (orderedIds.size() != submittedIds.size() || !expectedIds.equals(submittedIds)) {
            throw new CustomException(400, "Danh sách thứ tự vòng tuyển dụng không hợp lệ");
        }
        Map<Long, HiringRoundEntity> byId = new HashMap<>();
        rounds.forEach(round -> byId.put(round.getId(), round));
        for (int index = 0; index < orderedIds.size(); index++) byId.get(orderedIds.get(index)).setOrderIndex(index);
        hiringRoundRepository.saveAll(rounds);
        return orderedIds.stream().map(byId::get).map(this::toDto).toList();
    }

    private void normalizeOrder(Long jobId, Long companyId) {
        List<HiringRoundEntity> rounds = hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(jobId, companyId);
        for (int index = 0; index < rounds.size(); index++) rounds.get(index).setOrderIndex(index);
        hiringRoundRepository.saveAll(rounds);
    }

    private JobEntity getAccessibleJob(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId).orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));
        if (!job.getCompany().getId().equals(companyId)) throw new CustomException(403, "Bạn không có quyền truy cập Job này");
        if (Boolean.TRUE.equals(job.getIsDeleted())) throw new CustomException(404, "Job này đã bị xóa");
        return job;
    }

    private HiringRoundEntity getRound(Long roundId, Long jobId, Long companyId) {
        return hiringRoundRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(roundId, jobId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy vòng tuyển dụng"));
    }

    private void syncRoundCount(JobEntity job, int count) { job.setRoundCount(count); jobRepository.save(job); }

    private HiringRoundDTO toDto(HiringRoundEntity round) {
        return HiringRoundDTO.builder().id(round.getId()).name(round.getName()).description(round.getDescription())
                .orderIndex(round.getOrderIndex()).passEmailTemplateId(round.getPassEmailTemplateId())
                .failEmailTemplateId(round.getFailEmailTemplateId()).testLink(round.getTestLink())
                .isFinalRound(round.getIsFinalRound()).createdAt(round.getCreatedAt()).updatedAt(round.getUpdatedAt()).build();
    }
}
