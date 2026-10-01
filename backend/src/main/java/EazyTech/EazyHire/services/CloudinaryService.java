package EazyTech.EazyHire.services;

import EazyTech.EazyHire.core.exceptions.CustomException;
import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > 2 * 1024 * 1024)
            throw new CustomException(400, "Ảnh không hợp lệ hoặc vượt quá 2MB.");
            
        String name = Optional.ofNullable(file.getOriginalFilename()).orElse("").toLowerCase();
        String ext = name.substring(name.lastIndexOf('.') + 1);
        String mime = file.getContentType();

        if (!Set.of("png", "jpg", "jpeg", "webp").contains(ext) || mime == null ||
            !Set.of("image/png", "image/jpeg", "image/webp").contains(mime))
            throw new CustomException(415, "Chỉ nhận ảnh PNG, JPG, JPEG hoặc WEBP.");

        try {
            byte[] bytes = file.getBytes();
            
            // Generate public_id using UUID to avoid duplicates
            String publicId = "eazyhire_test_" + UUID.randomUUID().toString();
            
            Map uploadResult = cloudinary.uploader().upload(
                    bytes,
                    ObjectUtils.asMap(
                            "resource_type", "image",
                            "folder", "eazyhire_assets",
                            "public_id", publicId,
                            "overwrite", true
                    )
            );

            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new CustomException(500, "Không thể lưu ảnh lên Cloudinary. Vui lòng thử lại.");
        }
    }
}
