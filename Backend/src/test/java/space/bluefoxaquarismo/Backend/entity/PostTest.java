package space.bluefoxaquarismo.Backend.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class PostTest {

    @Test
    @DisplayName("Should create post using no args constructor")
    void shouldCreatePostUsingNoArgsConstructor() {
        Post post = new Post();

        assertNotNull(post);

        assertNull(post.getId());
        assertNull(post.getTitle());
        assertNull(post.getDescription());
        assertNull(post.getImageUrl());
        assertNull(post.getSlug());
        assertNull(post.getReadingTime());
        assertFalse(post.isPublished());
        assertEquals(Status.ACTIVE, post.getStatus());
        assertNull(post.getPublishedAt());
        assertEquals(0L, post.getViews());
        assertNull(post.getAuthor());
        assertNull(post.getCategory());
        assertNull(post.getCreatedAt());
        assertNull(post.getUpdatedAt());
    }

    @Test
    @DisplayName("Should create post using all args constructor")
    void shouldCreatePostUsingAllArgsConstructor() {
        UUID id = UUID.randomUUID();
        OffsetDateTime publishedAt = OffsetDateTime.now();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        Author mockAuthor = new Author();
        Category mockCategory = new Category();

        Post post = new Post(
                id,
                "Como montar seu primeiro aquário plantado",
                "Um guia passo a passo completo para iniciantes no aquarismo plantado...",
                "https://example.com/images/aquario-plantado.jpg",
                "como-montar-seu-primeiro-aquario-plantado",
                "5 min",
                true,
                Status.ACTIVE,
                publishedAt,
                1250L,
                mockAuthor,
                mockCategory,
                createdAt,
                updatedAt
        );

        assertEquals(id, post.getId());
        assertEquals("Como montar seu primeiro aquário plantado", post.getTitle());
        assertEquals("Um guia passo a passo completo para iniciantes no aquarismo plantado...", post.getDescription());
        assertEquals("https://example.com/images/aquario-plantado.jpg", post.getImageUrl());
        assertEquals("como-montar-seu-primeiro-aquario-plantado", post.getSlug());
        assertEquals("5 min", post.getReadingTime());
        assertTrue(post.isPublished());
        assertEquals(Status.ACTIVE, post.getStatus());
        assertEquals(publishedAt, post.getPublishedAt());
        assertEquals(1250L, post.getViews());
        assertEquals(mockAuthor, post.getAuthor());
        assertEquals(mockCategory, post.getCategory());
        assertEquals(createdAt, post.getCreatedAt());
        assertEquals(updatedAt, post.getUpdatedAt());
    }

    @Test
    @DisplayName("Should create post using builder")
    void shouldCreatePostUsingBuilder() {
        Author mockAuthor = new Author();
        Category mockCategory = new Category();

        Post post = Post.builder()
                .title("Como montar seu primeiro aquário plantado")
                .description("Um guia passo a passo completo para iniciantes no aquarismo plantado...")
                .imageUrl("https://example.com/images/aquario-plantado.jpg")
                .slug("como-montar-seu-primeiro-aquario-plantado")
                .readingTime("5 min")
                .author(mockAuthor)
                .category(mockCategory)
                .build();

        assertNotNull(post);
        assertEquals("Como montar seu primeiro aquário plantado", post.getTitle());
        assertEquals("Um guia passo a passo completo para iniciantes no aquarismo plantado...", post.getDescription());
        assertEquals("https://example.com/images/aquario-plantado.jpg", post.getImageUrl());
        assertEquals("como-montar-seu-primeiro-aquario-plantado", post.getSlug());
        assertEquals("5 min", post.getReadingTime());
        assertEquals(mockAuthor, post.getAuthor());
        assertEquals(mockCategory, post.getCategory());

        // Valores default pelo @Builder.Default do lombok
        assertNull(post.getId());
        assertFalse(post.isPublished());
        assertEquals(Status.ACTIVE, post.getStatus());
        assertEquals(0L, post.getViews());
        assertNull(post.getPublishedAt());
        assertNull(post.getCreatedAt());
        assertNull(post.getUpdatedAt());
    }

    @Test
    @DisplayName("Should update fields using setters")
    void shouldUpdateFieldsUsingSetters() {
        Post post = new Post();

        UUID id = UUID.randomUUID();
        OffsetDateTime publishedAt = OffsetDateTime.now();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();
        Author mockAuthor = new Author();
        Category mockCategory = new Category();

        post.setId(id);
        post.setTitle("Como montar seu primeiro aquário plantado");
        post.setDescription("Um guia passo a passo completo para iniciantes no aquarismo plantado...");
        post.setImageUrl("https://example.com/images/aquario-plantado.jpg");
        post.setSlug("como-montar-seu-primeiro-aquario-plantado");
        post.setReadingTime("5 min");
        post.setPublished(true);
        post.setStatus(Status.INACTIVE);
        post.setPublishedAt(publishedAt);
        post.setViews(100L);
        post.setAuthor(mockAuthor);
        post.setCategory(mockCategory);
        post.setCreatedAt(createdAt);
        post.setUpdatedAt(updatedAt);

        assertEquals(id, post.getId());
        assertEquals("Como montar seu primeiro aquário plantado", post.getTitle());
        assertEquals("Um guia passo a passo completo para iniciantes no aquarismo plantado...", post.getDescription());
        assertEquals("https://example.com/images/aquario-plantado.jpg", post.getImageUrl());
        assertEquals("como-montar-seu-primeiro-aquario-plantado", post.getSlug());
        assertEquals("5 min", post.getReadingTime());
        assertTrue(post.isPublished());
        assertEquals(Status.INACTIVE, post.getStatus());
        assertEquals(publishedAt, post.getPublishedAt());
        assertEquals(100L, post.getViews());
        assertEquals(mockAuthor, post.getAuthor());
        assertEquals(mockCategory, post.getCategory());
        assertEquals(createdAt, post.getCreatedAt());
        assertEquals(updatedAt, post.getUpdatedAt());
    }

    @Test
    @DisplayName("Should support equals and hashCode correctly")
    void shouldSupportEqualsAndHashCodeCorrectly() {
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        Post post1 = Post.builder()
                .id(id)
                .title("Como montar seu primeiro aquário plantado")
                .slug("como-montar-seu-primeiro-aquario-plantado")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Post post2 = Post.builder()
                .id(id)
                .title("Outro título qualquer") // Diferente para testar a unicidade pelo ID
                .slug("outro-slug")
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertEquals(post1, post2);
        assertEquals(post1.hashCode(), post2.hashCode());
    }

    @Test
    @DisplayName("Should support equals and hashCode with different ids")
    void shouldSupportEqualsAndHashCodeWithDifferentIds() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        Post post1 = Post.builder()
                .id(id1)
                .title("Como montar seu primeiro aquário plantado")
                .slug("como-montar-seu-primeiro-aquario-plantado")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Post post2 = Post.builder()
                .id(id2)
                .title("Como montar seu primeiro aquário plantado")
                .slug("como-montar-seu-primeiro-aquario-plantado")
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertNotEquals(post1, post2);
        assertNotEquals(post1.hashCode(), post2.hashCode());
    }

    @Test
    @DisplayName("Should support toString correctly")
    void shouldSupportToStringCorrectly() {
        Post post = Post.builder()
                .title("Como montar seu primeiro aquário plantado")
                .description("Um guia passo a passo completo para iniciantes no aquarismo plantado...")
                .slug("como-montar-seu-primeiro-aquario-plantado")
                .build();

        String result = post.toString();

        assertNotNull(result);
        assertTrue(result.contains("Como montar seu primeiro aquário plantado"));
        assertTrue(result.contains("Um guia passo a passo completo para iniciantes no aquarismo plantado..."));
        assertTrue(result.contains("como-montar-seu-primeiro-aquario-plantado"));
        assertTrue(result.contains("ACTIVE"));

        // Garante que os relacionamentos excluídos no @ToString não gerem NullPointerException ou apareçam aqui
        assertFalse(result.contains("author="));
        assertFalse(result.contains("category="));
    }
}