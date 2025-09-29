package com.autofuellanka.systemmanager.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/**") // cover all endpoints
                        // allow all localhost ports in dev
                        .allowedOriginPatterns("http://localhost:*")
                        // methods you want to expose
                        .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                        .allowedHeaders("*")
                        .allowCredentials(true) // enable if you use cookies/session auth
                        .maxAge(3600); // cache preflight response for 1h
            }
        };
    }
}
