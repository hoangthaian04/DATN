package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.models.dtos.AuditActorDTO;
import EazyTech.EazyHire.models.dtos.AuditLogDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.AuditLogFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.AuditLogResponseDTO;
import EazyTech.EazyHire.models.entities.AuditLogEntity;
import EazyTech.EazyHire.models.entities.CompanyEntity;
import EazyTech.EazyHire.models.entities.UserEntity;
import EazyTech.EazyHire.repositories.AuditLogRepository;
import EazyTech.EazyHire.repositories.AuditLogSpecifications;
import EazyTech.EazyHire.repositories.CompanyRepository;
import EazyTech.EazyHire.repositories.UserRepository;
import EazyTech.EazyHire.services.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogServiceImpl implements AuditLogService {
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;

    @Override
    public Page<AuditLogResponseDTO> getLogs(AuditLogFilterRequestDTO request) {
        Page<AuditLogEntity> page = auditLogRepository.findAll(
                AuditLogSpecifications.search(
                        request.normalizedAction(),
                        request.normalizedEmail(),
                        request.getStartDateTime(),
                        request.getEndDateTimeExclusive()
                ),
                request.getPageable()
        );
        Map<Long, UserEntity> actors = userRepository.findAllById(
                page.getContent().stream()
                        .map(AuditLogEntity::getActorUserId)
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(UserEntity::getId, Function.identity()));
        Map<Long, CompanyEntity> companies = companyRepository.findAllById(
                page.getContent().stream()
                        .map(AuditLogEntity::getCompanyId)
                        .filter(java.util.Objects::nonNull)
                        .collect(Collectors.toSet())
        ).stream().collect(Collectors.toMap(CompanyEntity::getId, Function.identity()));

        return page.map(log -> toListDTO(log, actors.get(log.getActorUserId()), companies.get(log.getCompanyId())));
    }

    @Override
    public AuditLogDetailResponseDTO getLog(Long id) {
        AuditLogEntity log = auditLogRepository.findById(id)
                .orElseThrow(() -> new CustomException(404, "Không tìm thấy audit log"));
        UserEntity actor = log.getActorUserId() == null
                ? null
                : userRepository.findById(log.getActorUserId()).orElse(null);
        CompanyEntity company = log.getCompanyId() == null
                ? null
                : companyRepository.findById(log.getCompanyId()).orElse(null);
        return toDetailDTO(log, actor, company);
    }

    private AuditLogResponseDTO toListDTO(AuditLogEntity log, UserEntity actor, CompanyEntity company) {
        return AuditLogResponseDTO.builder()
                .id(log.getId())
                .actor(toActorDTO(log, actor))
                .companyId(log.getCompanyId())
                .companyName(company == null ? null : company.getName())
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .ipAddress(log.getIpAddress())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private AuditLogDetailResponseDTO toDetailDTO(AuditLogEntity log, UserEntity actor, CompanyEntity company) {
        return AuditLogDetailResponseDTO.builder()
                .id(log.getId())
                .actor(toActorDTO(log, actor))
                .companyId(log.getCompanyId())
                .companyName(company == null ? null : company.getName())
                .action(log.getAction())
                .targetType(log.getTargetType())
                .targetId(log.getTargetId())
                .ipAddress(log.getIpAddress())
                .userAgent(log.getUserAgent())
                .requestId(log.getRequestId())
                .metadata(log.getMetadata())
                .createdAt(log.getCreatedAt())
                .build();
    }

    private AuditActorDTO toActorDTO(AuditLogEntity log, UserEntity actor) {
        if (actor == null && log.getActorUserId() == null) {
            return null;
        }
        return AuditActorDTO.builder()
                .id(log.getActorUserId())
                .email(actor == null ? null : actor.getEmail())
                .fullName(actor == null ? null : actor.getFullName())
                .role(log.getActorRole() != null
                        ? log.getActorRole()
                        : actor == null || actor.getRole() == null ? null : actor.getRole().name())
                .build();
    }
}
