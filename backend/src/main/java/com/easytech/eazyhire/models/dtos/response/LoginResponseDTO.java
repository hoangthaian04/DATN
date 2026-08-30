package com.easytech.eazyhire.models.dtos.response;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponseDTO {
    @JsonIgnore
    private String accessToken;
    @JsonIgnore
    private String refreshToken;
    private String tokenType;
    private Long expiresIn;
    private UserResponseDTO user;
}
