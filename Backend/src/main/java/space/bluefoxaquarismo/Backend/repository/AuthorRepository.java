package space.bluefoxaquarismo.Backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import space.bluefoxaquarismo.Backend.entity.Author;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

/**
 * Repository responsible for database operations related to {@link Author}.
 *
 * <p>
 * Provides methods for querying and validating authors
 * by slug, name, email, and status.
 * </p>
 */
@Repository
public interface AuthorRepository extends JpaRepository<Author, UUID> {

    /**
     * Finds an author by their full name.
     *
     * @param name The name of the author to find.
     * @return An {@link Optional} containing the found author, or an empty {@link Optional} if not found.
     */
    Optional<Author> findByName(String name);

    /**
     * Finds an author by their unique slug.
     *
     * @param slug The unique slug of the author to find.
     * @return An {@link Optional} containing the found author, or an empty {@link Optional} if not found.
     */
    Optional<Author> findBySlug(String slug);

    /**
     * Finds an author by their unique email.
     *
     * @param email The unique email of the author to find.
     * @return An {@link Optional} containing the found author, or an empty {@link Optional} if not found.
     */
    Optional<Author> findByEmail(String email);

    /**
     * Checks if an author with the given name exists.
     *
     * @param name The name of the author to check.
     * @return True if an author with the given name exists, false otherwise.
     */
    boolean existsByName(String name);

    /**
     * Checks if an author with the given slug exists.
     *
     * @param slug The slug of the author to check.
     * @return True if an author with the given slug exists, false otherwise.
     */
    boolean existsBySlug(String slug);

    /**
     * Checks if an author with the given email exists.
     *
     * @param email The email of the author to check.
     * @return True if an author with the given email exists, false otherwise.
     */
    boolean existsByEmail(String email);

    /**
     * Finds all authors by their status.
     *
     * @param status The status of the authors to find.
     * @return A {@link List} of authors with the given status.
     */
    List<Author> findAllByStatus(Status status);
}