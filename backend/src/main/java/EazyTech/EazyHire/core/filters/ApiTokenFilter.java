package EazyTech.EazyHire.core.filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.services.cache.AuthCacheService;

import java.io.IOException;

// @Component - Disabled: We use JwtAuthenticationFilter in SecurityConfig instead
public class ApiTokenFilter extends OncePerRequestFilter {
    private static final Logger logger = LoggerFactory.getLogger(ApiTokenFilter.class);

    @Autowired
    private AuthCacheService cacheService;

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        String path = request.getServletPath();
        return path.startsWith("/base/google-ads/oauth/callback") || path.startsWith("/_private/");
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String jwt = request.getHeader("Authorization");
        if (jwt == null || !isValidToken(jwt)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("Unauthenticated");
            return;
        }
        filterChain.doFilter(request, response);
    }

    private boolean isValidToken(String token) {
        if (!token.startsWith("Bearer ")) {
            return false;
        }
        token = token.replaceFirst("Bearer ", "");
        try {
            AuthorizedUser user = cacheService.getUserByToken(token);
            if (user == null) {
                throw new Exception(String.format("Token %s not found", token));
            }
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(user, null, user.getAuthorities());
            SecurityContextHolder.getContext().setAuthentication(authentication);
            return true;
        } catch (Exception e) {
            logger.error(e.getMessage());
            return false;
        }
    }
}
