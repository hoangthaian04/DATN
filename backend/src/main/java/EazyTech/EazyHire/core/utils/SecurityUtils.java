package EazyTech.EazyHire.core.utils;

import EazyTech.EazyHire.core.AuthorizedUser;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

public class SecurityUtils {
    public static Optional<AuthorizedUser> getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof AuthorizedUser) {
            return Optional.of((AuthorizedUser) authentication.getPrincipal());
        }
        return Optional.empty();
    }
}
