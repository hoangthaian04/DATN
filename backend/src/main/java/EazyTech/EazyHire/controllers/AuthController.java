package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.core.exceptions.CustomException;
import EazyTech.EazyHire.core.utils.SecurityUtils;
import EazyTech.EazyHire.models.dtos.LoginRequestDTO;
import EazyTech.EazyHire.models.dtos.OnboardingRequestDTO;
import EazyTech.EazyHire.models.dtos.RegisterRequestDTO;
import EazyTech.EazyHire.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public BaseResponse register(@Valid @RequestBody RegisterRequestDTO request) {
        return new BaseResponse(authService.register(request));
    }

    @PostMapping("/login")
    public BaseResponse login(@Valid @RequestBody LoginRequestDTO request) {
        return new BaseResponse(authService.login(request));
    }

    @PostMapping("/onboarding")
    public BaseResponse onboarding(@Valid @RequestBody OnboardingRequestDTO request) {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));

        return new BaseResponse(authService.onboarding(user.getId(), request));
    }

    @GetMapping("/me")
    public BaseResponse getMe() {
        AuthorizedUser user = SecurityUtils.getCurrentUser()
                .orElseThrow(() -> new CustomException(401, "Yêu cầu đăng nhập"));

        return new BaseResponse(authService.getMe(user.getId()));
    }

    @PostMapping("/refresh")
    public BaseResponse refresh(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new CustomException(400, "Refresh token không được để trống");
        }
        return new BaseResponse(authService.refreshToken(refreshToken));
    }
}
