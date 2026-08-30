package com.easytech.eazyhire.services.impl;

import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.services.LogoStorageService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
public class LogoStorageServiceImpl implements LogoStorageService {
    private static final long MAX_LOGO_SIZE = 2L * 1024L * 1024L;
    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/png", ".png",
            "image/jpeg", ".jpg",
            "image/webp", ".webp"
    );

    private final Path storageDirectory;

    public LogoStorageServiceImpl(@Value("${app.storage.logo-directory:uploads/company-logos}") String directory) {
        this.storageDirectory = Path.of(directory).toAbsolutePath().normalize();
    }

    @Override
    public String store(Long companyId, MultipartFile file) {
        if (file == null || file.isEmpty()) throw new CustomException(400, "Vui lòng chọn file logo");
        if (file.getSize() > MAX_LOGO_SIZE) throw new CustomException(400, "Logo không được vượt quá 2MB");
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) throw new CustomException(400, "Logo chỉ hỗ trợ PNG, JPG hoặc WEBP");

        try {
            Files.createDirectories(storageDirectory);
            String fileName = "company-" + companyId + "-" + UUID.randomUUID() + extension;
            Path target = storageDirectory.resolve(fileName).normalize();
            if (!target.startsWith(storageDirectory)) throw new CustomException(400, "Tên file không hợp lệ");
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/company-logos/" + fileName;
        } catch (IOException exception) {
            throw new CustomException(500, "Không thể lưu logo doanh nghiệp", exception);
        }
    }
}
