package space.bluefoxaquarismo.Backend.config.cache;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CacheScheduler {

    private final CacheManager cacheManager;

    @Autowired
    public CacheScheduler(@Autowired(required = false) CacheManager cacheManager) {
        this.cacheManager = cacheManager;
    }

    /**
     * Limpa o cache de posts mais relevantes diariamente à meia-noite.
     */
    @Scheduled(cron = "0 0 0 * * *")
    public void evictMostRelevantPostsCache() {
        if (cacheManager != null) {
            Cache cache = cacheManager.getCache("mostRelevantPosts");
            if (cache != null) {
                log.info("Limpando cache de posts mais relevantes...");
                cache.clear();
            }
        } else {
            log.warn("CacheManager não disponível para limpar o cache 'mostRelevantPosts'.");
        }
    }
}