package space.bluefoxaquarismo.Backend.config.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Converter that extracts Keycloak Realm Roles from the JWT claim
 * {@code realm_access.roles} and converts them to Spring Security
 * {@link GrantedAuthority} instances.
 *
 * <p>The roles emitted by Keycloak already include the {@code ROLE_} prefix
 * (e.g. {@code ROLE_ADMIN}, {@code ROLE_USER}), so this converter creates
 * {@link SimpleGrantedAuthority} directly without adding the prefix again.</p>
 *
 * <p>This allows {@code @PreAuthorize("hasRole('ADMIN')")} to work correctly,
 * since Spring Security's {@code hasRole()} automatically prepends {@code ROLE_}
 * when matching against the granted authorities.</p>
 */
public class KeycloakJwtAuthenticationConverter implements Converter<Jwt, Collection<GrantedAuthority>> {

    private static final String REALM_ACCESS_CLAIM = "realm_access";
    private static final String ROLES_KEY = "roles";

    @Override
    public Collection<GrantedAuthority> convert(Jwt jwt) {
        Map<String, Object> realmAccess = jwt.getClaimAsMap(REALM_ACCESS_CLAIM);

        if (realmAccess == null || realmAccess.isEmpty()) {
            return Collections.emptyList();
        }

        Object rolesObj = realmAccess.get(ROLES_KEY);

        if (!(rolesObj instanceof List<?> roles)) {
            return Collections.emptyList();
        }

        return roles.stream()
                .filter(String.class::isInstance)
                .map(String.class::cast)
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toUnmodifiableList());
    }
}
