package space.bluefoxaquarismo.Backend.repository;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import space.bluefoxaquarismo.Backend.entity.Post;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.util.List;
import java.util.Optional;
import java.util.Set;
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
     * Finds all active and published posts with their respective relations preloaded,
     * ordered by the most recently published.
     *
     * @param status The lifecycle status of the posts (usually Status with ACTIVE).
     * @return A {@link List} of published posts sorted by publication date.
     */
    @EntityGraph(attributePaths = {"category", "author"})
    @Query("select distinct p from Post p where p.status = :status and p.published = true order by p.publishedAt desc")
    List<Post> findAllPublishedByStatusOrderByPublishedAtDesc(Status status);

    /**
     * Finds all active and published posts with their respective comments, author,
     * category, and recommended post-IDs preloaded.
     *
     * @param status The status of the posts to find.
     * @return A {@link List} of published posts with their relations initialized.
     */
    @EntityGraph(attributePaths = {"category", "author", "comments", "recommendedPostIds"})
    @Query("select distinct p from Post p where p.status = :status and p.published = true")
    List<Post> findAllPublishedByStatusWithComments(Status status);

    /**
     * Finds a post by id with relation.
     *
     * @param id The unique id of the post to find.
     * @return An {@link Optional} containing the found post with relation, or an empty {@link Optional} if not found.
     */
    @EntityGraph(attributePaths = {"category", "author"})
    @Query("select p from Post p where p.id = :id")
    Optional<Post> findPostWithRelationsById(UUID id);

    /**
     *  Find all the post with relation.
     *
     * @return A {@link List} of posts with relation.
     */
    @EntityGraph(attributePaths = {"category", "author"})
    @Query("select p from Post p")
    List<Post> findAllWithRelations();

    /**
     * Finds a post by its unique, SEO-friendly slug.
     *
     * @param slug The unique slug of the post to find.
     * @return An {@link Optional} containing the found post, or an empty {@link Optional} if not found.
     */
    @EntityGraph(attributePaths = {"category", "author", "recommendedPostIds"})
    Optional<Post> findBySlug(String slug);

    /**
     * Finds all active and published posts by a set of IDs,
     * preloading category and author to ensure high performance.
     *
     * @param ids The Set of UUIDs of the posts to find.
     * @return A {@link List} of published posts.
     */
    @EntityGraph(attributePaths = {"category", "author"})
    @Query("select distinct p from Post p where p.id in :ids and p.status = 'ACTIVE' and p.published = true")
    List<Post> findAllPublishedByIds(@Param("ids") Set<UUID> ids);

    /**
     * Finds all active and published posts of a specific category.
     *
     * @param categoryId The unique identifier of the category.
     * @return A {@link List} of published posts.
     */
    @EntityGraph(attributePaths = {"category", "author", "comments", "recommendedPostIds"})
    @Query("select distinct p from Post p where p.category.id = :categoryId and p.status = 'ACTIVE' and p.published = true order by p.publishedAt desc")
    List<Post> findLatestPublishedByCategoryId(UUID categoryId);

    /**
     * Finds all active and published posts published before a specific date.
     *
     * @param publishedAt The threshold publication date.
     * @return A {@link List} of published posts.
     */
    @EntityGraph(attributePaths = {"category", "author", "comments", "recommendedPostIds"})
    @Query("select distinct p from Post p where p.status = 'ACTIVE' and p.published = true and p.publishedAt < :publishedAt order by p.publishedAt desc")
    List<Post> findPublishedBefore(java.time.OffsetDateTime publishedAt);

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
    @EntityGraph(attributePaths = {"category", "author"})
    List<Post> findAllByStatus(Status status);

    /**
     * Finds all posts that match a specific publishing status and lifecycle status.
     * Useful for retrieving only public articles for the blog feed.
     *
     * @param published The publishing status to filter by (true/false).
     * @param status    The current lifecycle status of the post.
     * @return A {@link List} of posts matching both criteria.
     */
    @EntityGraph(attributePaths = {"category", "author"})
    List<Post> findAllByPublishedAndStatus(boolean published, Status status);

    /**
     * Finds all posts belonging to a specific author.
     *
     * @param authorId The unique identifier of the author.
     * @return A {@link List} of posts written by the specified author.
     */
    @EntityGraph(attributePaths = {"category", "author"})
    List<Post> findAllByAuthorId(UUID authorId);

    /**
     * Finds all posts belonging to a specific category.
     *
     * @param categoryId The unique identifier of the category.
     * @return A {@link List} of posts associated with the specified category.
     */
    @EntityGraph(attributePaths = {"category", "author"})
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
    @EntityGraph(attributePaths = {"category", "author"})
    List<Post> findAllByCategoryIdAndPublishedAndStatus(UUID categoryId, boolean published, Status status);
}