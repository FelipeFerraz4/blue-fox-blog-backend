package space.bluefoxaquarismo.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.bluefoxaquarismo.Backend.entity.Blog;

import java.util.UUID;

/**
 * Repository responsible for database operations related to {@link Blog}.
 *
 * <p>
 * Provides methods for querying and validating blog
 * by slug and status.
 * </p>
 */
@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {
}
