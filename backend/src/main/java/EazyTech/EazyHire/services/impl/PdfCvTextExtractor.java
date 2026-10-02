package EazyTech.EazyHire.services.impl;

import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.services.CvTextExtractor;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class PdfCvTextExtractor implements CvTextExtractor {

    @Override
    public String extract(byte[] fileBytes) {
        if (fileBytes == null || fileBytes.length == 0) {
            throw new CustomException(422, "CV không có dữ liệu để phân tích");
        }
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            String text = new PDFTextStripper().getText(document).trim();
            if (text.isBlank()) {
                throw new CustomException(422, "AI không thể đọc được nội dung CV này. Vui lòng kiểm tra lại file hoặc chấm thủ công.");
            }
            return text;
        } catch (CustomException exception) {
            throw exception;
        } catch (IOException | RuntimeException exception) {
            throw new CustomException(422, "AI không thể đọc được nội dung CV này. Vui lòng kiểm tra lại file hoặc chấm thủ công.", exception);
        }
    }
}
