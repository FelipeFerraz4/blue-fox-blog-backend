package space.bluefoxaquarismo.Backend.config.tenant;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.annotation.Nonnull;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import java.util.UUID;

@Component
public class TenantInterceptor implements HandlerInterceptor {

    private static final String TENANT_HEADER = "X-Blog-ID";

    @Override
    public boolean preHandle(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull Object handler
    ) throws Exception {
        String tenantIdHeader = request.getHeader(TENANT_HEADER);

        if (tenantIdHeader != null && !tenantIdHeader.isBlank()) {
            try {
                TenantContext.setCurrentTenant(UUID.fromString(tenantIdHeader));
            } catch (IllegalArgumentException e) {
                response.sendError(HttpServletResponse.SC_BAD_REQUEST, "Invalid X-Blog-ID format.");
                return false;
            }
        }
        return true;
    }

    @Override
    public void afterCompletion(
            @Nonnull HttpServletRequest request,
            @Nonnull HttpServletResponse response,
            @Nonnull Object handler,
            Exception ex
    ) {
        // ESSENCIAL para evitar vazamento de dados entre threads concorrentes na VPS
        TenantContext.clear();
    }
}