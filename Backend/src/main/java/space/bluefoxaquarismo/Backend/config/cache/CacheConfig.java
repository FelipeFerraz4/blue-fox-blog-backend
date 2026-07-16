package space.bluefoxaquarismo.Backend.config.cache;

import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableCaching // O cache agora fica isolado aqui
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        // Inicializa o gerenciador de cache padrão em memória do Spring
        return new ConcurrentMapCacheManager("mostRelevantPosts");
    }
}