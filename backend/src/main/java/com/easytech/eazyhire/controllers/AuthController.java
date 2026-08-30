package com.easytech.eazyhire.controllers;

import com.easytech.eazyhire.core.AuthorizedUser;
import com.easytech.eazyhire.core.BaseResponse;
import com.easytech.eazyhire.core.exceptions.CustomException;
import com.easytech.eazyhire.core.utils.SecurityUtils;
import com.easytech.eazyhire.models.dtos.request.GoogleLoginRequestDTO;
import com.easytech.eazyhire.models.dtos.request.LoginRequestDTO;
import com.easytech.eazyhire.models.dtos.response.LoginResponseDTO;
import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.security.AuthCookieService;
import com.easytech.eazyhire.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final AuthCookieService authCookieService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public BaseResponse register(@Valid @RequestBody RegisterRequestDTO request) {
        return new BaseResponse(authService.register(request));
    }

    @PostMapping("/login")
    public BaseResponse login(@Valid @RequestBody LoginRequestDTO request, HttpServletResponse response) {
        return createSessionResponse(authService.login(request), response);
    }

    @PostMapping("/google")
    public BaseResponse googleLogin(
            @Valid @RequestBody GoogleLoginRequestDTO request,
            HttpServletResponse response
    ) {
        return createSessionResponse(authService.googleLogin(request), response);
    }

    @GetMapping("/me")
    public BaseResponse getMe() {
        return new BaseResponse(authService.getMe(currentUser().getId()));
    }

    @GetMapping("/csrf")
    public BaseResponse csrf(CsrfToken csrfToken) {
        return new BaseResponse(csrfToken.getToken());
    }

    @GetMapping("/health")
    public BaseResponse health() {
        return BaseResponse.success("ok");
    }

    @PostMapping("/refresh")
    public BaseResponse refresh(
            @CookieValue(value = AuthCookieService.REFRESH_COOKIE, required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new CustomException(401, "Refresh token không tồn tại");
        }
        return createSessionResponse(authService.refreshToken(refreshToken), response);
    }

    @PostMapping("/logout")
    public BaseResponse logout(HttpServletResponse response) {
        authCookieService.clearSession(response);
        return BaseResponse.success("Đăng xuất thành công");
    }

    private BaseResponse createSessionResponse(LoginResponseDTO session, HttpServletResponse response) {
        authCookieService.writeSession(response, session);
        return new BaseResponse(session);
    }

    private AuthorizedUser currentUser() {
        return SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));
    }
}
