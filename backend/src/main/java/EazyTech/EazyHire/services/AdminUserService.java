package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.AdminUserDetailResponseDTO;
import EazyTech.EazyHire.models.dtos.AdminUserFilterRequestDTO;
import EazyTech.EazyHire.models.dtos.AdminUserStatusRequestDTO;
import EazyTech.EazyHire.models.dtos.AdminUserSummaryResponseDTO;
import org.springframework.data.domain.Page;

public interface AdminUserService {
    Page<AdminUserSummaryResponseDTO> getUsers(AdminUserFilterRequestDTO request);

    AdminUserDetailResponseDTO getUser(Long id);

    void changeStatus(Long id, Long actorId, AdminUserStatusRequestDTO request);
}
