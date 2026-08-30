package com.easytech.eazyhire.configs;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final Path logoDirectory;

    public WebConfig(@Value("${app.storage.logo-directory:uploads/company-logos}") String directory) {
        this.logoDirectory = Path.of(directory).toAbsolutePath().normalize();
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/company-logos/**")
                .addResourceLocations(logoDirectory.toUri().toString());
    }
}
