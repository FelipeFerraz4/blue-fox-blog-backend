package space.bluefoxaquarismo.Backend.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class AuthorTest {

    @Test
    @DisplayName("Should create author using no args constructor")
    void shouldCreateAuthorUsingNoArgsConstructor() {
        Author author = new Author();

        assertNotNull(author);

        assertNull(author.getId());
        assertNull(author.getName());
        assertNull(author.getBio());
        assertNull(author.getProfilePictureUrl());
        assertNull(author.getSlug());
        assertNull(author.getEmail());
        assertEquals(Status.ACTIVE, author.getStatus());
        assertNull(author.getCreatedAt());
        assertNull(author.getUpdatedAt());
    }

    @Test
    @DisplayName("Should create author using all args constructor")
    void shouldCreateAuthorUsingAllArgsConstructor() {
        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        Author author = new Author(
                id,
                "Leila Cunha Cardoso",
                "Aquarist specialized in freshwater aquascaping.",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leilacunha@gmail.com",
                Status.ACTIVE,
                createdAt,
                updatedAt
        );

        assertEquals(id, author.getId());
        assertEquals("Leila Cunha Cardoso", author.getName());
        assertEquals("Aquarist specialized in freshwater aquascaping.", author.getBio());
        assertEquals("https://example.com/profile.jpg", author.getProfilePictureUrl());
        assertEquals("leila-cunha-cardoso", author.getSlug());
        assertEquals("leilacunha@gmail.com", author.getEmail());
        assertEquals(Status.ACTIVE, author.getStatus());
        assertEquals(createdAt, author.getCreatedAt());
        assertEquals(updatedAt, author.getUpdatedAt());
    }

    @Test
    @DisplayName("Should create author using builder")
    void shouldCreateAuthorUsingBuilder() {
        Author author = Author.builder()
                .name("Leila Cunha Cardoso")
                .bio("Aquarist specialized in freshwater aquascaping.")
                .profilePictureUrl("https://example.com/profile.jpg")
                .slug("leila-cunha-cardoso")
                .email("leilacunha@gmail.com")
                .build();

        assertNotNull(author);
        assertEquals("Leila Cunha Cardoso", author.getName());
        assertEquals("Aquarist specialized in freshwater aquascaping.", author.getBio());
        assertEquals("https://example.com/profile.jpg", author.getProfilePictureUrl());
        assertEquals("leila-cunha-cardoso", author.getSlug());
        assertEquals("leilacunha@gmail.com", author.getEmail());

        assertNull(author.getId());
        assertEquals(Status.ACTIVE, author.getStatus());
        assertNull(author.getCreatedAt());
        assertNull(author.getUpdatedAt());
    }

    @Test
    @DisplayName("Should update fields using setters")
    void shouldUpdateFieldsUsingSetters() {
        Author author = new Author();

        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        author.setId(id);
        author.setName("Leila Cunha Cardoso");
        author.setBio("Aquarist specialized in freshwater aquascaping.");
        author.setProfilePictureUrl("https://example.com/profile.jpg");
        author.setSlug("leila-cunha-cardoso");
        author.setEmail("leilacunha@gmail.com");
        author.setStatus(Status.INACTIVE);
        author.setCreatedAt(createdAt);
        author.setUpdatedAt(updatedAt);

        assertEquals(id, author.getId());
        assertEquals("Leila Cunha Cardoso", author.getName());
        assertEquals("Aquarist specialized in freshwater aquascaping.", author.getBio());
        assertEquals("https://example.com/profile.jpg", author.getProfilePictureUrl());
        assertEquals("leila-cunha-cardoso", author.getSlug());
        assertEquals("leilacunha@gmail.com", author.getEmail());
        assertEquals(Status.INACTIVE, author.getStatus());
        assertEquals(createdAt, author.getCreatedAt());
        assertEquals(updatedAt, author.getUpdatedAt());
    }

    @Test
    @DisplayName("Should support equals and hashCode correctly")
    void shouldSupportEqualsAndHashCodeCorrectly() {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        Author author1 = Author.builder()
                .id(id)
                .name("Leila Cunha Cardoso")
                .slug("leila-cunha-cardoso")
                .email("leilacunha@gmail.com")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Author author2 = Author.builder()
                .id(id)
                .name("Another Name") // Diferente para garantir que a comparação foca apenas no ID
                .slug("another-slug")
                .email("another@gmail.com")
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertEquals(author1, author2);
        assertEquals(author1.hashCode(), author2.hashCode());
    }

    @Test
    @DisplayName("Should support equals and hashCode with different ids")
    void shouldSupportEqualsAndHashCodeWithDifferentIds() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        Author author1 = Author.builder()
                .id(id1)
                .name("Leila Cunha Cardoso")
                .slug("leila-cunha-cardoso")
                .email("leilacunha@gmail.com")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Author author2 = Author.builder()
                .id(id2)
                .name("Leila Cunha Cardoso")
                .slug("leila-cunha-cardoso")
                .email("leilacunha@gmail.com")
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertNotEquals(author1, author2);
        assertNotEquals(author1.hashCode(), author2.hashCode());
    }

    @Test
    @DisplayName("Should support toString correctly")
    void shouldSupportToStringCorrectly() {
        Author author = Author.builder()
                .name("Leila Cunha Cardoso")
                .bio("Aquarist specialized in freshwater aquascaping.")
                .slug("leila-cunha-cardoso")
                .email("leilacunha@gmail.com")
                .build();

        String result = author.toString();

        assertNotNull(result);
        assertTrue(result.contains("Leila Cunha Cardoso"));
        assertTrue(result.contains("Aquarist specialized in freshwater aquascaping."));
        assertTrue(result.contains("leila-cunha-cardoso"));
        assertTrue(result.contains("leilacunha@gmail.com"));
        assertTrue(result.contains("ACTIVE"));
    }
}