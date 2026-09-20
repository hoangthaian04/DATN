package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.AdminUserCompanyDTO;
import EazyTech.EazyHire.models.dtos.AdminUserDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.AdminUserFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.AdminUserLoginDTO;
import EazyTech.EazyHire.models.dtos.AdminUserStatusRequestDTO;
import EazyTech.EazyHire.models.dtos.AdminUserSummaryResponseDTO;
import EazyTech.EazyHire.models.entities.AuditLogEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.models.enums.UserRole;
import EazyTech.EazyHire.models.enums.UserStatus;
import EazyTech.EazyHire.repositories.AuditLogRepository;
import EazyTech.EazyHire.repositories.AdminUserSpecifications;
import EazyTech.EazyHire.repositories.JobRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.services.AdminUserService;
import EazyTech.EazyHire.services.AuditService;
import EazyTech.EazyHire.services.UserAccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {
    private final UserRepository userRepository;
    private final JobRepository jobRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserAccountService accounts;
    private final AuditService auditService;

    @Override
    @Transactional(readOnly = true)
    public Page<AdminUserSummaryResponseDTO> getUsers(AdminUserFilterRequestDTO request) {
        return userRepository.findAll(
                AdminUserSpecifications.search(
                        request.normalizedSearch(),
                        request.getCompanyId(),
                        request.getRole(),
                        request.getStatus()
                ),
                request.getPageable()
        ).map(this::toSummary);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminUserDetailResponseDTO getUser(Long id) {
        UserEntity user = findUser(id);
        CompanyEntity company = user.getCompany();
        List<AdminUserLoginDTO> recentLogins = auditLogRepository.findRecentLoginEvents(id, PageRequest.of(0, 10))
                .stream()
                .map(this::toLogin)
                .toList();

        return AdminUserDetailResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .company(company == null ? null : AdminUserCompanyDTO.builder()
                        .id(company.getId())
                        .name(company.getName())
                        .build())
                .jobsCreatedCount(jobRepository.countByCreatedByIdAndIsDeletedFalse(id))
                .recentLogins(recentLogins)
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    @Override
    @Transactional
    public void changeStatus(Long id, Long actorId, AdminUserStatusRequestDTO request) {
        UserEntity admin = accounts.requireAdmin(actorId);
        UserEntity user = findUser(id);
        UserStatus previousStatus = user.getStatus();

        if (admin.getId().equals(user.getId())) {
            throw new CustomException(400, "Không thể tự vô hiệu hóa tài khoản Admin đang đăng nhập");
        }
        if (user.getRole() == UserRole.ADMIN) {
            throw new CustomException(403, "Không thể thay đổi trạng thái tài khoản System Admin từ màn hình này");
        }
        if (request.getStatus() != UserStatus.ACTIVE && request.getStatus() != UserStatus.INACTIVE) {
            throw new CustomException(400, "Chỉ hỗ trợ trạng thái ACTIVE hoặc INACTIVE");
        }
        if (previousStatus != UserStatus.ACTIVE && previousStatus != UserStatus.INACTIVE) {
            throw new CustomException(409, "Tài khoản phải ở trạng thái ACTIVE hoặc INACTIVE mới có thể đổi trong US-09");
        }
        if (previousStatus == request.getStatus()) {
            throw new CustomException(409, "Tài khoản đã ở trạng thái được yêu cầu");
        }
        if (request.getStatus() == UserStatus.INACTIVE
                && (request.getReason() == null || request.getReason().isBlank())) {
            throw new CustomException(400, "Lý do là bắt buộc khi vô hiệu hóa tài khoản");
        }

        user.setStatus(request.getStatus());
        user.setTokenVersion(user.getTokenVersion() == null ? 1 : user.getTokenVersion() + 1);
        userRepository.save(user);

        String action = request.getStatus() == UserStatus.INACTIVE
                ? "DEACTIVATE_USER"
                : "ACTIVATE_USER";
        String reason = request.getReason() == null ? "" : request.getReason().trim();
        auditService.recordGlobal(
                admin.getId(),
                "USER",
                user.getId(),
                action,
                "previousStatus=" + previousStatus + ";newStatus=" + request.getStatus() + ";reason=" + reason
        );
    }

    private UserEntity findUser(Long id) {
        return userRepository.findByIdWithCompany(id)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy người dùng"));
    }

    private AdminUserSummaryResponseDTO toSummary(UserEntity user) {
        CompanyEntity company = user.getCompany();
        return AdminUserSummaryResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .companyId(company == null ? null : company.getId())
                .companyName(company == null ? null : company.getName())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }

    private AdminUserLoginDTO toLogin(AuditLogEntity log) {
        return AdminUserLoginDTO.builder()
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .loginAt(log.getCreatedAt())
                .build();
    }
}
