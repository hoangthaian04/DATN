package EazyTech.EazyHire.core.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.vector-embedding")
@Getter
@Setter
public class AppVectorEmbeddingProperties {
    private String baseUrl = "http://localhost:8000";
    private int timeout = 60;
}
