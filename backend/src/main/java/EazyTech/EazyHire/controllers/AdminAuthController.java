package EazyTech.EazyHire.controllers;

import EazyTech.EazyHire.core.BaseResponse;
import EazyTech.EazyHire.models.dtos.LoginRequestDTO;
import EazyTech.EazyHire.services.AuthService;
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

    @PostMapping("/login")
    public BaseResponse adminLogin(@Valid @RequestBody LoginRequestDTO request) {
        return new BaseResponse(authService.adminLogin(request));
    }
}
