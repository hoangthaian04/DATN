package com.easytech.eazyhire.security;

import com.easytech.eazyhire.core.AuthorizedUser;
import com.easytech.eazyhire.models.entities.UserEntity;
import com.easytech.eazyhire.models.enums.CompanyStatus;
import com.easytech.eazyhire.models.enums.UserRole;
import com.easytech.eazyhire.models.enums.UserStatus;
import com.easytech.eazyhire.services.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;
    private final UserService userService;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        try {
            extractAccessToken(request)
                    .filter(jwtTokenProvider::validateAccessToken)
                    .map(jwtTokenProvider::getAuthorizedUserFromToken)
                    .flatMap(this::refreshAuthorizedUser)
                    .ifPresent(this::authenticate);
        } catch (RuntimeException exception) {
            SecurityContextHolder.clearContext();
            log.debug("Access token was rejected: {}", exception.getMessage());
        }

        filterChain.doFilter(request, response);
    }

    private Optional<String> extractAccessToken(HttpServletRequest request) {
        if (request.getCookies() != null) {
            Optional<String> cookieToken = Arrays.stream(request.getCookies())
                    .filter(cookie -> AuthCookieService.ACCESS_COOKIE.equals(cookie.getName()))
                    .map(Cookie::getValue)
                    .filter(value -> !value.isBlank())
                    .findFirst();
            if (cookieToken.isPresent()) {
                return cookieToken;
            }
        }

        String authorization = request.getHeader("Authorization");
        if (authorization != null && authorization.startsWith(BEARER_PREFIX)) {
            return Optional.of(authorization.substring(BEARER_PREFIX.length()));
        }
        return Optional.empty();
    }

    private Optional<AuthorizedUser> refreshAuthorizedUser(AuthorizedUser tokenUser) {
        UserEntity currentUser = userService.getByIdWithCompany(tokenUser.getId());
        if (!isAccountActive(currentUser)) {
            return Optional.empty();
        }

        return Optional.of(AuthorizedUser.builder()
                .id(currentUser.getId())
                .email(currentUser.getEmail())
                .name(currentUser.getFullName())
                .companyId(currentUser.getCompany() == null ? null : currentUser.getCompany().getId())
                .companyStatus(currentUser.getCompany() == null ? null : currentUser.getCompany().getStatus().name())
                .roles(List.of("ROLE_" + currentUser.getRole().name()))
                .build());
    }

    private boolean isAccountActive(UserEntity user) {
        if (user.getStatus() != UserStatus.ACTIVE) {
            return false;
        }
        if (user.getRole() == UserRole.ADMIN) {
            return true;
        }
        return user.getCompany() != null && user.getCompany().getStatus() == CompanyStatus.ACTIVE;
    }

    private void authenticate(AuthorizedUser authorizedUser) {
        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        authorizedUser,
                        null,
                        authorizedUser.getAuthorities()
                );
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
