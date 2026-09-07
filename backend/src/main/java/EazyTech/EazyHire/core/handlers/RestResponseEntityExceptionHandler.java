package EazyTech.EazyHire.core.handlers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

@RestControllerAdvice
public class RestResponseEntityExceptionHandler {

    // Xử lý lỗi nghiệp vụ từ CustomException
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<BaseResponse> handleCustomException(CustomException ex) {
        BaseResponse response = BaseResponse.fail(ex.getMessage());
        HttpStatus httpStatus = HttpStatus.resolve(ex.getStatusCode());
        if (httpStatus == null) {
            httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        }
        return ResponseEntity.status(httpStatus).body(response);
    }

    // Xử lý lỗi validation từ @Valid
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<BaseResponse> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldErrors()
                .stream()
                .map(FieldError::getDefaultMessage)
                .collect(Collectors.joining("; "));
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(BaseResponse.fail(errorMessage));
    }

    @ExceptionHandler({org.springframework.http.converter.HttpMessageNotReadableException.class,
        org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class,
        org.springframework.web.bind.MissingServletRequestParameterException.class,
        org.springframework.web.multipart.support.MissingServletRequestPartException.class})
    public ResponseEntity<BaseResponse> handleBadRequest(Exception ex){
      return ResponseEntity.badRequest().body(BaseResponse.fail("Dữ liệu không hợp lệ. Vui lòng kiểm tra các trường, định dạng và trạng thái."));
    }
    @ExceptionHandler(org.springframework.dao.DataIntegrityViolationException.class)
    public ResponseEntity<BaseResponse> handleConflict(Exception ex){
      return ResponseEntity.status(409).body(BaseResponse.fail("Dữ liệu bị trùng hoặc không còn hợp lệ. Vui lòng tải lại và kiểm tra email, mã số thuế, subdomain."));
    }
    @ExceptionHandler(org.springframework.web.multipart.MaxUploadSizeExceededException.class)
    public ResponseEntity<BaseResponse> handleUpload(Exception ex){
      return ResponseEntity.badRequest().body(BaseResponse.fail("Logo không hợp lệ hoặc vượt quá dung lượng cho phép."));
    }
    // Xử lý lỗi không mong muốn (fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse> handleGenericException(Exception ex) {
        ex.printStackTrace(); // Log ra console để dễ debug
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BaseResponse.fail("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."));
    }
}
