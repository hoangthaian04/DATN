package EazyTech.EazyHire.services.cache;

import com.fasterxml.jackson.core.JsonProcessingException;
import EazyTech.EazyHire.core.AbstractCacheService;
import EazyTech.EazyHire.core.AuthorizedUser;
import EazyTech.EazyHire.core.RedisClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class AuthCacheService extends AbstractCacheService {
    private static final Logger logger = LoggerFactory.getLogger(AuthCacheService.class);
    private static final String NAMESPACE = "auth";

    private final RedisClient redisClient;

    public AuthCacheService(RedisClient redisClient) {
        super(redisClient, "datn");
        this.redisClient = redisClient;
    }

    public AuthorizedUser getUserByToken(String token) {
        try {
            return redisClient.getObject(String.format("datn:%s:token:%s", NAMESPACE, token), AuthorizedUser.class);
        } catch (JsonProcessingException e) {
            logger.error("Cannot get user by token: {}", e.getMessage());
            return null;
        }
    }

    public void cacheUserToken(String token, AuthorizedUser user) {
        try {
            redisClient.setObject(String.format("datn:%s:token:%s", NAMESPACE, token), user, 86400);
        } catch (JsonProcessingException e) {
            logger.error("Cannot cache user token: {}", e.getMessage());
        }
    }

    public void removeToken(String token) {
        // TODO: Implement token removal
    }
}
