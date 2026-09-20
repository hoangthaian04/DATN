package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.HiringRoundDTO;
import EazyTech.EazyHire.models.dtos.HiringRoundRequestDTO;
import EazyTech.EazyHire.models.entities.HiringRoundEntity;
import EazyTech.EazyHire.models.entities.JobEntity;
import EazyTech.EazyHire.repositories.ApplicationRepository;
import EazyTech.EazyHire.repositories.HiringRoundRepository;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.HiringRoundService;
import EazyTech.EazyHire.services.UserAccountService;
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
    private final UserAccountService accounts;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public List<HiringRoundDTO> getRounds(Long jobId, Long companyId, Long userId) {
        ensureActiveWorkspace(companyId, userId);
        getAccessibleJob(jobId, companyId);
        return hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(jobId, companyId)
                .stream().map(this::toDto).toList();
    }

    @Override
    @Transactional
    public HiringRoundDTO createRound(Long jobId, Long companyId, Long userId, HiringRoundRequestDTO request) {
        ensureActiveWorkspace(companyId, userId);
        JobEntity job = getEditableJob(jobId, companyId);
        int nextOrder = (int) hiringRoundRepository.countByJobIdAndCompanyIdAndIsDeletedFalse(jobId, companyId);
        HiringRoundEntity round = HiringRoundEntity.builder()
                .company(job.getCompany()).job(job).name(request.getName().trim())
                .description(request.getDescription()).orderIndex(nextOrder)
                .passEmailTemplateId(request.getPassEmailTemplateId()).failEmailTemplateId(request.getFailEmailTemplateId())
                .testLink(request.getTestLink()).isFinalRound(Boolean.TRUE.equals(request.getIsFinalRound())).build();
        HiringRoundEntity saved = hiringRoundRepository.save(round);
        syncRoundCount(job, nextOrder + 1);
        auditService.recordTarget(userId, companyId, "HIRING_ROUND", saved.getId(), "CREATE_HIRING_ROUND", "Tạo vòng tuyển dụng: " + saved.getName());
        return toDto(saved);
    }

    @Override
    @Transactional
    public HiringRoundDTO updateRound(Long jobId, Long roundId, Long companyId, Long userId, HiringRoundRequestDTO request) {
        ensureActiveWorkspace(companyId, userId);
        getEditableJob(jobId, companyId);
        HiringRoundEntity round = getRound(roundId, jobId, companyId);
        round.setName(request.getName().trim());
        round.setDescription(request.getDescription());
        round.setPassEmailTemplateId(request.getPassEmailTemplateId());
        round.setFailEmailTemplateId(request.getFailEmailTemplateId());
        round.setTestLink(request.getTestLink());
        round.setIsFinalRound(Boolean.TRUE.equals(request.getIsFinalRound()));
        HiringRoundEntity saved = hiringRoundRepository.save(round);
        auditService.recordTarget(userId, companyId, "HIRING_ROUND", saved.getId(), "UPDATE_HIRING_ROUND", "Cập nhật vòng tuyển dụng: " + saved.getName());
        return toDto(saved);
    }

    @Override
    @Transactional
    public void deleteRound(Long jobId, Long roundId, Long companyId, Long userId) {
        ensureActiveWorkspace(companyId, userId);
        JobEntity job = getEditableJob(jobId, companyId);
        HiringRoundEntity round = getRound(roundId, jobId, companyId);
        if (applicationRepository.existsByJobIdAndCurrentRoundId(jobId, roundId)) {
            throw new CustomException(400, "Vòng này đang có ứng viên. Bạn cần chuyển họ sang vòng khác trước khi xóa.");
        }
        String roundName = round.getName();
        round.setIsDeleted(true);
        hiringRoundRepository.save(round);
        normalizeOrder(jobId, companyId);
        syncRoundCount(job, (int) hiringRoundRepository.countByJobIdAndCompanyIdAndIsDeletedFalse(jobId, companyId));
        auditService.recordTarget(userId, companyId, "HIRING_ROUND", roundId, "DELETE_HIRING_ROUND", "Xóa mềm vòng tuyển dụng: " + roundName);
    }

    @Override
    @Transactional
    public List<HiringRoundDTO> reorderRounds(Long jobId, Long companyId, Long userId, List<Long> orderedIds) {
        ensureActiveWorkspace(companyId, userId);
        getEditableJob(jobId, companyId);
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
        auditService.recordTarget(userId, companyId, "JOB", jobId, "REORDER_HIRING_ROUNDS", "Cập nhật thứ tự vòng tuyển dụng");
        return orderedIds.stream().map(byId::get).map(this::toDto).toList();
    }

    private void normalizeOrder(Long jobId, Long companyId) {
        List<HiringRoundEntity> rounds = hiringRoundRepository.findByJobIdAndCompanyIdAndIsDeletedFalseOrderByOrderIndexAsc(jobId, companyId);
        for (int index = 0; index < rounds.size(); index++) rounds.get(index).setOrderIndex(index);
        hiringRoundRepository.saveAll(rounds);
    }

    private JobEntity getAccessibleJob(Long jobId, Long companyId) {
        JobEntity job = jobRepository.findById(jobId).orElseThrow(() -> new CustomException(404, "Không tìm thấy Job"));
        if (job.getCompany() == null || !job.getCompany().getId().equals(companyId)) {
            throw new CustomException(404, "Không tìm thấy Job trong workspace hiện tại");
        }
        if (Boolean.TRUE.equals(job.getIsDeleted())) throw new CustomException(404, "Job này đã bị xóa");
        return job;
    }

    private JobEntity getEditableJob(Long jobId, Long companyId) {
        JobEntity job = getAccessibleJob(jobId, companyId);
        if ("CLOSED".equals(job.getStatus())) {
            throw new CustomException(409, "Job đã CLOSED, không thể chỉnh sửa vòng tuyển dụng");
        }
        return job;
    }

    private HiringRoundEntity getRound(Long roundId, Long jobId, Long companyId) {
        return hiringRoundRepository.findByIdAndJobIdAndCompanyIdAndIsDeletedFalse(roundId, jobId, companyId)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy vòng tuyển dụng"));
    }

    private void syncRoundCount(JobEntity job, int count) { job.setRoundCount(count); jobRepository.save(job); }

    private void ensureActiveWorkspace(Long companyId, Long userId) {
        if (companyId == null || userId == null) {
            throw new CustomException(403, "Tài khoản chưa thuộc workspace tuyển dụng hợp lệ");
        }
        var user = accounts.requireHr(userId, true);
        if (user.getCompany() == null || !companyId.equals(user.getCompany().getId())) {
            throw new CustomException(403, "Bạn không có quyền thao tác trong workspace này");
        }
    }

    private HiringRoundDTO toDto(HiringRoundEntity round) {
        return HiringRoundDTO.builder().id(round.getId()).name(round.getName()).description(round.getDescription())
                .orderIndex(round.getOrderIndex()).passEmailTemplateId(round.getPassEmailTemplateId())
                .failEmailTemplateId(round.getFailEmailTemplateId()).testLink(round.getTestLink())
                .isFinalRound(round.getIsFinalRound()).createdAt(round.getCreatedAt()).updatedAt(round.getUpdatedAt()).build();
    }
}
