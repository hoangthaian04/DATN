package EazyTech.EazyHire.services;

import org.springframework.web.multipart.MultipartFile;

public interface CvStorageService {

    String store(Long companyId, Long jobId, MultipartFile file);
}
