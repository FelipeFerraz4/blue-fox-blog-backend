package space.bluefoxaquarismo.Backend.config.security;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security configuration for the OAuth2 Resource Server.
 *
 * <p>This class sets up the backend to validate JWTs issued by Keycloak
 * without performing any login — it acts purely as a Resource Server.</p>
 *
 * <h3>Key decisions:</h3>
 * <ul>
 *   <li>CSRF disabled — stateless REST API, no browser-based sessions.</li>
 *   <li>Sessions are STATELESS — each request carries its own JWT.</li>
 *   <li>CORS delegated to the {@link CorsConfig#corsConfigurationSource()} bean.</li>
 *   <li>GET endpoints are public (blog content is publicly readable).</li>
 *   <li>PATCH {@code /api/v1/posts/views/**} is public (view counter increment).</li>
 *   <li>Swagger/OpenAPI endpoints are public only in dev (controlled by
 *       {@code springdoc.api-docs.enabled}).</li>
 *   <li>All other endpoints require a valid JWT.</li>
 *   <li>Realm roles are extracted from the JWT by
 *       {@link KeycloakJwtAuthenticationConverter}.</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Value("${springdoc.api-docs.enabled:true}")
    private boolean swaggerEnabled;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Disable CSRF — stateless REST API, no session cookies
                .csrf(csrf -> csrf.disable())

                // Stateless session — no server-side session created
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // CORS — uses the CorsConfigurationSource bean from CorsConfig
                .cors(cors -> {})

                // Authorization rules
                .authorizeHttpRequests(auth -> {
                    // Public endpoints
                    auth.requestMatchers("/public/**").permitAll();
                    auth.requestMatchers("/actuator/health/**").permitAll();

                    // Swagger/OpenAPI — public only when springdoc is enabled (dev)
                    if (swaggerEnabled) {
                        auth.requestMatchers(
                                "/swagger-ui/**",
                                "/swagger-ui.html",
                                "/v3/api-docs/**"
                        ).permitAll();
                    }

                    // Public read endpoints — blog content is publicly accessible
                    auth.requestMatchers(HttpMethod.GET, "/api/v1/**").permitAll();

                    // Public view counter increment (no auth needed)
                    auth.requestMatchers(HttpMethod.PATCH, "/api/v1/posts/views/**").permitAll();

                    // All other requests require authentication
                    auth.anyRequest().authenticated();
                })

                // OAuth2 Resource Server — validate JWTs from Keycloak
                .oauth2ResourceServer(oauth2 ->
                        oauth2.jwt(jwt ->
                                jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())
                        )
                );

        return http.build();
    }

    /**
     * Configures the {@link JwtAuthenticationConverter} to use
     * {@link KeycloakJwtAuthenticationConverter} for extracting
     * granted authorities from the Keycloak JWT's {@code realm_access.roles} claim.
     */
    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(new KeycloakJwtAuthenticationConverter());
        return converter;
    }
}
