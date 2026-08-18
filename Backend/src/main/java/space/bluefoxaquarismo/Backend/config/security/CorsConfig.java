package space.bluefoxaquarismo.Backend.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * CORS configuration exposed as a {@link CorsConfigurationSource} bean.
 *
 * <p>Spring Security automatically picks up this bean and applies the CORS
 * policy at the security filter level. This ensures that preflight (OPTIONS)
 * requests are handled correctly before any authentication check.</p>
 */
@Configuration
public class CorsConfig {

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:4200"));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of(
                "Authorization",
                "X-Blog-ID",
                "Content-Type",
                "X-XSRF-TOKEN",
                "X-Requested-With",
                "Origin",
                "Accept",
                "Cookie"
        ));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}