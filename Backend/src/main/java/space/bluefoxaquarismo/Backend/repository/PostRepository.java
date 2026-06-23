package space.bluefoxaquarismo.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.bluefoxaquarismo.Backend.entity.Post;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository responsible for database operations related to {@link Post}.
 *
 * <p>
 * Provides methods for querying, filtering, and validating blog posts
 * by slug, status, author, and category.
 * </p>
 */
@Repository
public interface PostRepository extends JpaRepository<Post, UUID> {

    /**
     * Finds a post by its unique, SEO-friendly slug.
     *
     * @param slug The unique slug of the post to find.
     * @return An {@link Optional} containing the found post, or an empty {@link Optional} if not found.
     */
    Optional<Post> findBySlug(String slug);

    /**
     * Checks if a post with the given slug exists.
     *
     * @param slug The slug of the post to check.
     * @return True if a post with the given slug exists, false otherwise.
     */
    boolean existsBySlug(String slug);

    /**
     * Finds all posts by their current status.
     *
     * @param status The status of the posts to find.
     * @return A {@link List} of posts with the given status.
     */
    List<Post> findAllByStatus(Status status);

    /**
     * Finds all posts that match a specific publishing status and lifecycle status.
     * Useful for retrieving only public articles for the blog feed.
     *
     * @param published The publishing status to filter by (true/false).
     * @param status    The current lifecycle status of the post.
     * @return A {@link List} of posts matching both criteria.
     */
    List<Post> findAllByPublishedAndStatus(boolean published, Status status);

    /**
     * Finds all posts belonging to a specific author.
     *
     * @param authorId The unique identifier of the author.
     * @return A {@link List} of posts written by the specified author.
     */
    List<Post> findAllByAuthorId(UUID authorId);

    /**
     * Finds all posts belonging to a specific category.
     *
     * @param categoryId The unique identifier of the category.
     * @return A {@link List} of posts associated with the specified category.
     */
    List<Post> findAllByCategoryId(UUID categoryId);

    /**
     * Finds all active and published posts belonging to a specific category.
     * Ideal for rendering category-specific feeds on the front-end.
     *
     * @param categoryId Medical identifier of the category.
     * @param published  The publishing status to filter by.
     * @param status     The current lifecycle status of the post.
     * @return A {@link List} of visible posts in that category.
     */
    List<Post> findAllByCategoryIdAndPublishedAndStatus(UUID categoryId, boolean published, Status status);
}