package space.bluefoxaquarismo.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.stereotype.Repository;
import space.bluefoxaquarismo.Backend.entity.Comment;

import java.util.UUID;

/**
 * Repository responsible for database operations related to {@link Comment}.
 *
 * <p>
 * Provides methods for querying and validating comment
 * by slug and status.
 * </p>
 */
@Repository
public interface CommentRepository  extends JpaRepository<Comment, UUID> {
}
