package EazyTech.EazyHire;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.services.LocalCvStorageService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

import java.nio.charset.StandardCharsets;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class LocalCvStorageServiceTest {

    @TempDir
    Path tempDir;

    @Test
    void storesPdfUnderPrivateStorageKey() {
        LocalCvStorageService service = new LocalCvStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "cvFile", "candidate.pdf", "application/pdf",
                "%PDF-1.7\nCV content".getBytes(StandardCharsets.US_ASCII)
        );

        String result = service.store(1L, 20L, file);

        assertTrue(result.startsWith("private://candidate-cvs/1/20/"));
        assertTrue(result.endsWith(".pdf"));
    }

    @Test
    void acceptsPdfWhenBrowserSendsGenericMultipartMime() {
        LocalCvStorageService service = new LocalCvStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "cvFile", "candidate.pdf", "application/octet-stream",
                "%PDF-1.7\nCV content".getBytes(StandardCharsets.US_ASCII)
        );

        String result = service.store(1L, 20L, file);

        assertTrue(result.startsWith("private://candidate-cvs/1/20/"));
    }

    @Test
    void acceptsPdfWhenBrowserOmitsMultipartMime() {
        LocalCvStorageService service = new LocalCvStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "cvFile", "candidate.pdf", null,
                "%PDF-1.7\nCV content".getBytes(StandardCharsets.US_ASCII)
        );

        String result = service.store(1L, 20L, file);

        assertTrue(result.startsWith("private://candidate-cvs/1/20/"));
    }

    @Test
    void acceptsPdfWhenBrowserOmitsFilenameExtension() {
        LocalCvStorageService service = new LocalCvStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "cvFile", "candidate", "application/octet-stream",
                "%PDF-1.7\nCV content".getBytes(StandardCharsets.US_ASCII)
        );

        String result = service.store(1L, 20L, file);

        assertTrue(result.startsWith("private://candidate-cvs/1/20/"));
    }

    @Test
    void rejectsFileWithPdfExtensionButInvalidContent() {
        LocalCvStorageService service = new LocalCvStorageService(tempDir.toString());
        MockMultipartFile file = new MockMultipartFile(
                "cvFile", "candidate.pdf", "application/pdf", "not a pdf".getBytes(StandardCharsets.US_ASCII)
        );

        CustomException exception = assertThrows(CustomException.class, () -> service.store(1L, 20L, file));

        assertEquals(415, exception.getStatusCode());
    }
}
