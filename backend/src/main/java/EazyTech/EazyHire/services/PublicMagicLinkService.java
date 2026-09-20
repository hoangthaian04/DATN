package EazyTech.EazyHire.services;

import EazyTech.EazyHire.models.dtos.PublicApplicationStatusResponseDTO;

public interface PublicMagicLinkService {

    PublicApplicationStatusResponseDTO verify(String token, String email);

    PublicApplicationStatusResponseDTO getStatus(String token, String email);

    void requestRecovery(String email, String companySlug);
}
