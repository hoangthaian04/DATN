package EazyTech.EazyHire.services;

import EazyTech.EazyHire.core.exceptions.CustomException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Service
public class LocalCvStorageService implements CvStorageService {

    private static final long MAX_CV_SIZE = 5L * 1024 * 1024;
    private static final int PDF_SIGNATURE_SCAN_BYTES = 1024;
    private static final String PDF_SIGNATURE = "%PDF-";
    private final Path root;

    public LocalCvStorageService(@Value("${app.cv-upload-dir:private-uploads}") String directory) {
        this.root = Path.of(directory).toAbsolutePath().normalize();
    }

    @Override
    public String store(Long companyId, Long jobId, MultipartFile file) {
        validate(file);
        String relativePath = "candidate-cvs/" + companyId + "/" + jobId + "/" + UUID.randomUUID() + ".pdf";
        Path target = root.resolve(relativePath).normalize();
        if (!target.startsWith(root)) {
            throw new CustomException(400, "Đường dẫn lưu CV không hợp lệ");
        }

        try {
            Files.createDirectories(target.getParent());
            Files.write(target, file.getBytes(), StandardOpenOption.CREATE_NEW);
            // This is an internal storage key, not a public URL. A future S3 adapter
            // can return its private object key without changing the application contract.
            return "private://" + relativePath.replace('\\', '/');
        } catch (IOException exception) {
            throw new CustomException(500, "Không thể lưu CV. Vui lòng thử lại");
        }
    }

    private void validate(MultipartFile file) {
        if (file == null || file.isEmpty() || file.getSize() > MAX_CV_SIZE) {
            throw new CustomException(400, "Chỉ chấp nhận file PDF tối đa 5MB");
        }
        try (var inputStream = file.getInputStream()) {
            byte[] header = inputStream.readNBytes(PDF_SIGNATURE_SCAN_BYTES);
            // The multipart MIME type and filename are supplied by the browser and may be
            // blank, generic, or missing on mobile browsers. The PDF signature in the
            // beginning of the content is the source of truth for this upload contract.
            if (!new String(header, StandardCharsets.ISO_8859_1).contains(PDF_SIGNATURE)) {
                throw new CustomException(415, "Chỉ chấp nhận file PDF tối đa 5MB");
            }
        } catch (IOException exception) {
            throw new CustomException(400, "Không thể đọc file CV");
        }
    }
}
