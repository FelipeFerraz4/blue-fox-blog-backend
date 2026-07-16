package space.bluefoxaquarismo.Backend.config.security;

import jakarta.annotation.Nonnull;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig {

    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(@Nonnull CorsRegistry registry) {
                registry.addMapping("/**")
                        .allowedOrigins("http://localhost:4200")
                        .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                        .allowedHeaders(
                                "Authorization",
                                "X-Blog-ID",
                                "Content-Type",
                                "X-XSRF-TOKEN",
                                "X-Requested-With",
                                "Origin",
                                "Accept",
                                "Cookie"
                        )
                        .allowCredentials(true);
            }
        };
    }
}