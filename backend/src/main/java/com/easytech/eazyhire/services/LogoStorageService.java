package com.easytech.eazyhire.services;

import org.springframework.web.multipart.MultipartFile;

public interface LogoStorageService {
    String store(Long companyId, MultipartFile file);
}
