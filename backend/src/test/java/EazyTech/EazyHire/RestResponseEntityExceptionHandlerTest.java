package EazyTech.EazyHire;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.handlers.RestResponseEntityExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpMediaTypeNotSupportedException;

import static org.assertj.core.api.Assertions.assertThat;

class RestResponseEntityExceptionHandlerTest {

    private final RestResponseEntityExceptionHandler handler = new RestResponseEntityExceptionHandler();

    @Test
    void returnsUnsupportedMediaTypeInsteadOfInternalServerError() {
        HttpMediaTypeNotSupportedException exception =
                new HttpMediaTypeNotSupportedException("Content-Type is not supported");

        ResponseEntity<BaseResponse> response = handler.handleUnsupportedMediaType(exception);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNSUPPORTED_MEDIA_TYPE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getStatus()).isZero();
        assertThat(response.getBody().getMessage())
                .isEqualTo("Định dạng request không được hỗ trợ. Vui lòng gửi multipart/form-data.");
        assertThat(response.getBody().getData()).isNull();
    }
}
