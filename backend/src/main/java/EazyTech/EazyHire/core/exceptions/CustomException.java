package EazyTech.EazyHire.core.exceptions;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CustomException extends RuntimeException {
    private final Integer statusCode;
    private final String message;

    public CustomException(Integer statusCode, String message) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
    }

    public CustomException(Integer statusCode, String message, Throwable cause) {
        super(message, cause);
        this.statusCode = statusCode;
        this.message = message;
    }
}
