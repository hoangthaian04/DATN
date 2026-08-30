package com.easytech.eazyhire.security;

import com.easytech.eazyhire.core.AuthorizedUser;
import com.easytech.eazyhire.models.entities.UserEntity;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

@Component
public class JwtTokenProvider {

    private final SecretKey key;
    private final long accessTokenExpirationMs;
    private final long refreshTokenExpirationMs;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String secret,
            @Value("${jwt.access-token-expiration-ms:900000}") long accessTokenExpirationMs,
            @Value("${jwt.refresh-token-expiration-ms:604800000}") long refreshTokenExpirationMs
    ) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
        this.refreshTokenExpirationMs = refreshTokenExpirationMs;
    }

    public String generateAccessToken(UserEntity user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + accessTokenExpirationMs);

        String companyStatus = (user.getCompany() != null && user.getCompany().getStatus() != null)
                ? user.getCompany().getStatus().name()
                : null;

        Long companyId = (user.getCompany() != null) ? user.getCompany().getId() : null;

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("email", user.getEmail())
                .claim("fullName", user.getFullName())
                .claim("role", user.getRole().name())
                .claim("companyId", companyId)
                .claim("companyStatus", companyStatus)
                .claim("type", "ACCESS")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(UserEntity user) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + refreshTokenExpirationMs);

        return Jwts.builder()
                .subject(String.valueOf(user.getId()))
                .claim("type", "REFRESH")
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    public boolean validateAccessToken(String token) {
        return validateTokenType(token, "ACCESS");
    }

    public boolean validateRefreshToken(String token) {
        return validateTokenType(token, "REFRESH");
    }

    private boolean validateTokenType(String token, String expectedType) {
        if (!validateToken(token)) return false;
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            return expectedType.equals(claims.get("type", String.class));
        } catch (JwtException | IllegalArgumentException exception) {
            return false;
        }
    }

    public AuthorizedUser getAuthorizedUserFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        Long userId = Long.valueOf(claims.getSubject());
        String email = claims.get("email", String.class);
        String fullName = claims.get("fullName", String.class);
        String role = claims.get("role", String.class);
        Long companyId = claims.get("companyId", Long.class);
        String companyStatus = claims.get("companyStatus", String.class);

        return AuthorizedUser.builder()
                .id(userId)
                .email(email)
                .name(fullName)
                .companyId(companyId)
                .companyStatus(companyStatus)
                .roles(role != null ? List.of("ROLE_" + role) : List.of())
                .build();
    }

    public Long getUserIdFromToken(String token) {
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return Long.valueOf(claims.getSubject());
    }

    public long getAccessTokenExpirationMs() {
        return accessTokenExpirationMs;
    }

    public long getRefreshTokenExpirationMs() {
        return refreshTokenExpirationMs;
    }
}
