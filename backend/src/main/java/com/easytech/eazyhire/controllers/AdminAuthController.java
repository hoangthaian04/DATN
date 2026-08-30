package com.easytech.eazyhire.controllers;

import com.easytech.eazyhire.core.BaseResponse;
import com.easytech.eazyhire.models.dtos.request.LoginRequestDTO;
import com.easytech.eazyhire.models.dtos.response.LoginResponseDTO;
import com.easytech.eazyhire.security.AuthCookieService;
import com.easytech.eazyhire.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/auth")
@RequiredArgsConstructor
public class AdminAuthController {

    private final AuthService authService;
    private final AuthCookieService authCookieService;

    @PostMapping("/login")
    public BaseResponse adminLogin(
            @Valid @RequestBody LoginRequestDTO request,
            HttpServletResponse response
    ) {
        LoginResponseDTO session = authService.adminLogin(request);
        authCookieService.writeSession(response, session);
        return new BaseResponse(session);
    }
}
