package space.bluefoxaquarismo.Backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import space.bluefoxaquarismo.Backend.config.AbstractIntegrationTest;
import space.bluefoxaquarismo.Backend.entity.Author;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class AuthorRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private AuthorRepository authorRepository;

    @BeforeEach
    void setUp() {
        authorRepository.deleteAll();
    }

    @Test
    @DisplayName("Should find author by name")
    void shouldFindAuthorByName() {
        Author author = Author.builder()
                .name("Leila Cunha Cardoso")
                .bio("Aquarist specialized in freshwater aquascaping.")
                .slug("leila-cunha-cardoso")
                .email("leila.cunha@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();

        authorRepository.save(author);

        Optional<Author> foundAuthor = authorRepository.findByName("Leila Cunha Cardoso");

        assertThat(foundAuthor).isPresent();
        assertThat(foundAuthor.get().getName()).isEqualTo("Leila Cunha Cardoso");
    }

    @Test
    @DisplayName("Should return empty when author name does not exist")
    void shouldReturnEmptyWhenAuthorNameDoesNotExist() {
        Optional<Author> foundAuthor = authorRepository.findByName("Unknown Author");

        assertThat(foundAuthor).isEmpty();
    }

    @Test
    @DisplayName("Should find author by slug")
    void shouldFindAuthorBySlug() {
        Author author = Author.builder()
                .name("John Doe")
                .bio("Marine biology researcher.")
                .slug("john-doe")
                .email("john.doe@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();

        authorRepository.save(author);

        Optional<Author> foundAuthor = authorRepository.findBySlug("john-doe");

        assertThat(foundAuthor).isPresent();
        assertThat(foundAuthor.get().getSlug()).isEqualTo("john-doe");
    }

    @Test
    @DisplayName("Should find author by email")
    void shouldFindAuthorByEmail() {
        Author author = Author.builder()
                .name("Alice Smith")
                .bio("Reef keeper expert.")
                .slug("alice-smith")
                .email("alice.smith@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();

        authorRepository.save(author);

        Optional<Author> foundAuthor = authorRepository.findByEmail("alice.smith@bluefoxaquarismo.space");

        assertThat(foundAuthor).isPresent();
        assertThat(foundAuthor.get().getEmail()).isEqualTo("alice.smith@bluefoxaquarismo.space");
    }

    @Test
    @DisplayName("Should return true when author exists by name")
    void shouldReturnTrueWhenAuthorExistsByName() {
        Author author = Author.builder()
                .name("Bob Wilson")
                .slug("bob-wilson")
                .email("bob.wilson@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();

        authorRepository.save(author);

        boolean exists = authorRepository.existsByName("Bob Wilson");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when author does not exist by name")
    void shouldReturnFalseWhenAuthorDoesNotExistByName() {
        boolean exists = authorRepository.existsByName("Unknown");

        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should return true when author exists by slug")
    void shouldReturnTrueWhenAuthorExistsBySlug() {
        Author author = Author.builder()
                .name("Charlie Brown")
                .slug("charlie-brown")
                .email("charlie.brown@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();

        authorRepository.save(author);

        boolean exists = authorRepository.existsBySlug("charlie-brown");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when author does not exist by slug")
    void shouldReturnFalseWhenAuthorDoesNotExistBySlug() {
        boolean exists = authorRepository.existsBySlug("unknown-slug");

        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should return true when author exists by email")
    void shouldReturnTrueWhenAuthorExistsByEmail() {
        Author author = Author.builder()
                .name("David Miller")
                .slug("david-miller")
                .email("david.miller@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();

        authorRepository.save(author);

        boolean exists = authorRepository.existsByEmail("david.miller@bluefoxaquarismo.space");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when author does not exist by email")
    void shouldReturnFalseWhenAuthorDoesNotExistByEmail() {
        boolean exists = authorRepository.existsByEmail("unknown@email.com");

        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should find all authors by status")
    void shouldFindAllAuthorsByStatus() {
        Author activeAuthor = Author.builder()
                .name("Eva Green")
                .slug("eva-green")
                .email("eva.green@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();

        Author inactiveAuthor = Author.builder()
                .name("Frank Castle")
                .slug("frank-castle")
                .email("frank.castle@bluefoxaquarismo.space")
                .status(Status.INACTIVE)
                .build();

        authorRepository.save(activeAuthor);
        authorRepository.save(inactiveAuthor);

        List<Author> activeAuthors = authorRepository.findAllByStatus(Status.ACTIVE);

        assertThat(activeAuthors)
                .hasSizeLessThanOrEqualTo(7)
                .extracting(Author::getName)
                .contains("Eva Green");

        assertThat(activeAuthors.getFirst().getStatus()).isEqualTo(Status.ACTIVE);
    }
}