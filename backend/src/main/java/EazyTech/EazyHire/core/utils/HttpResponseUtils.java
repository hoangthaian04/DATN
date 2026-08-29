package EazyTech.EazyHire.core.utils;

import EazyTech.EazyHire.core.BaseResponse;

public class HttpResponseUtils {
    public static BaseResponse errorClient(String message) {
        return BaseResponse.builder()
                .message(message)
                .status(400)
                .build();
    }
}
