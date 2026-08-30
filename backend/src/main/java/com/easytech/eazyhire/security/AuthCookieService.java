package com.easytech.eazyhire.security;

import com.easytech.eazyhire.models.dtos.response.LoginResponseDTO;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieService {
    public static final String ACCESS_COOKIE = "access_token";
    public static final String REFRESH_COOKIE = "refresh_token";

    private final JwtTokenProvider tokenProvider;
    private final boolean secure;

    public AuthCookieService(
            JwtTokenProvider tokenProvider,
            @Value("${auth.cookie.secure:false}") boolean secure
    ) {
        this.tokenProvider = tokenProvider;
        this.secure = secure;
    }

    public void writeSession(HttpServletResponse response, LoginResponseDTO session) {
        addCookie(response, ACCESS_COOKIE, session.getAccessToken(), "/",
                Duration.ofMillis(tokenProvider.getAccessTokenExpirationMs()));
        addCookie(response, REFRESH_COOKIE, session.getRefreshToken(), "/api/v1/auth",
                Duration.ofMillis(tokenProvider.getRefreshTokenExpirationMs()));
    }

    public void clearSession(HttpServletResponse response) {
        addCookie(response, ACCESS_COOKIE, "", "/", Duration.ZERO);
        addCookie(response, REFRESH_COOKIE, "", "/api/v1/auth", Duration.ZERO);
    }

    private void addCookie(HttpServletResponse response, String name, String value, String path, Duration maxAge) {
        ResponseCookie cookie = ResponseCookie.from(name, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Strict")
                .path(path)
                .maxAge(maxAge)
                .build();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }
}
