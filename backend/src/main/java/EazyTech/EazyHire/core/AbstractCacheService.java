package EazyTech.EazyHire.core;

import com.fasterxml.jackson.core.JsonProcessingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class AbstractCacheService {
    private static final Logger logger = LoggerFactory.getLogger(AbstractCacheService.class);
    private final RedisClient client;
    private final String prefix;

    public AbstractCacheService(RedisClient client, String prefix) {
        this.client = client;
        this.prefix = prefix;
    }

    public <T> void cache(String namespace, String id, T object) {
        try {
            client.setObject(String.format("%s:%s:%s", prefix, namespace, id), object);
        } catch (JsonProcessingException e) {
            logger.error(String.format("Cannot cache %s:%s:%s: %s", prefix, namespace, id, e.getMessage()));
        }
    }

    public <T> T get(String namespace, String id, Class<T> tClass) {
        try {
            return client.getObject(String.format("%s:%s:%s", prefix, namespace, id), tClass);
        } catch (JsonProcessingException e) {
            logger.error(String.format("Cannot get from cache %s:%s:%s: %s", prefix, namespace, id, e.getMessage()));
            return null;
        }
    }
}
