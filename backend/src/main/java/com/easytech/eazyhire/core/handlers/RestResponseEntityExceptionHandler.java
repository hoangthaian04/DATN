package com.easytech.eazyhire.core.handlers;

import com.easytech.eazyhire.core.BaseResponse;
import com.easytech.eazyhire.core.exceptions.CustomException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import lombok.extern.slf4j.Slf4j;

import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
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

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<BaseResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.warn("Database constraint rejected a request", ex);
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(BaseResponse.fail("Dữ liệu đã tồn tại hoặc xung đột với bản ghi hiện có"));
    }

    // Xử lý lỗi không mong muốn (fallback)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<BaseResponse> handleGenericException(Exception ex) {
        log.error("Unhandled request failure", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(BaseResponse.fail("Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau."));
    }
}
