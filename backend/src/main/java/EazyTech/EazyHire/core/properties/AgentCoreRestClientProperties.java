package EazyTech.EazyHire.core.properties;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app.agent-core")
@Getter
@Setter
public class AgentCoreRestClientProperties {
    private String baseUrl = "http://localhost:8080";
    private String authUsername;
    private String authPassword;
    private int connectTimeout = 30;
    private int readTimeout = 60;
    private int maxRetries = 3;
    private int retryDelay = 2;
}
