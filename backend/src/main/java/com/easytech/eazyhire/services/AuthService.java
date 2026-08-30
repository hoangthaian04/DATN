package com.easytech.eazyhire.services;

import com.easytech.eazyhire.models.dtos.request.GoogleLoginRequestDTO;
import com.easytech.eazyhire.models.dtos.request.LoginRequestDTO;
import com.easytech.eazyhire.models.dtos.response.LoginResponseDTO;
import com.easytech.eazyhire.models.dtos.response.RegistrationResponseDTO;
import com.easytech.eazyhire.models.dtos.request.RegisterRequestDTO;
import com.easytech.eazyhire.models.dtos.response.UserResponseDTO;

public interface AuthService {

    RegistrationResponseDTO register(RegisterRequestDTO request);

    LoginResponseDTO login(LoginRequestDTO request);

    LoginResponseDTO adminLogin(LoginRequestDTO request);

    LoginResponseDTO googleLogin(GoogleLoginRequestDTO request);

    UserResponseDTO getMe(Long userId);

    LoginResponseDTO refreshToken(String refreshToken);
}
