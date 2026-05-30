package space.bluefoxaquarismo.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.bluefoxaquarismo.Backend.entity.Category;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository responsible for database operations related to {@link Category}.
 *
 * <p>
 *     Provides methods for querying and validating categories
 *     by slug, name, and status.
 * </p>
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {

    /**
     * Finds a category by its name.
     *
     * @param name The name of the category to find.
     * @return An {@link Optional} containing the found category, or an empty {@link Optional} if not found.
     */
    Optional<Category> findByName(String name);

    /**
     * Finds a category by its unique slug.
     *
     * @param slug The unique slug of the category to find.
     * @return An {@link Optional} containing the found category, or an empty {@link Optional} if not found.
     */
    Optional<Category> findBySlug(String slug);

    /**
     * Checks if a category with the given name exists.
     *
     * @param name The name of the category to check.
     * @return True if a category with the given name exists, false otherwise.
     */
    boolean existsByName(String name);

    /**
     * Checks if a category with the given slug exists.
     * @param slug The slug of the category to check.
     * @return True if a category with the given slug exists, false otherwise.
     */
    boolean existsBySlug(String slug);

    /**
     * Finds all categories by their status.
     *
     * @param status The status of the categories to find.
     * @return A {@link List} of categories with the given status.
     */
    List<Category> findAllByStatus(Status status);
}
