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

    // Xử lý lỗi không mong muốn (fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse> handleGenericException(Exception ex) {
        ex.printStackTrace(); // Log ra console để dễ debug
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BaseResponse.fail("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."));
    }
}
