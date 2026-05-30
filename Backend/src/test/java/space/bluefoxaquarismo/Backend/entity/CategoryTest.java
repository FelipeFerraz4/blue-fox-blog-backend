package space.bluefoxaquarismo.Backend.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

public class CategoryTest {

    @Test
    @DisplayName("Should create category using no args constructor")
    void shouldCreateCategoryUsingNoArgsConstructor() {
        Category category = new Category();

        assertNotNull(category);

        assertNull(category.getId());
        assertNull(category.getName());
        assertNull(category.getDescription());
        assertNull(category.getSlug());
        assertEquals(Status.ACTIVE, category.getStatus());
        assertNull(category.getCreatedAt());
        assertNull(category.getUpdatedAt());
    }

    @Test
    @DisplayName("Should create category using all args constructor")
    void shouldCreateCategoryUsingAllArgsConstructor(){
        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        Category category = new Category(
                id,
                "Fish Care",
                "Fish health and maintenance",
                "fish-care",
                Status.ACTIVE,
                createdAt,
                updatedAt
        );

        assertEquals(id, category.getId());
        assertEquals("Fish Care", category.getName());
        assertEquals("Fish health and maintenance", category.getDescription());
        assertEquals("fish-care", category.getSlug());
        assertEquals(Status.ACTIVE, category.getStatus());
        assertEquals(createdAt, category.getCreatedAt());
        assertEquals(updatedAt, category.getUpdatedAt());
    }

    @Test
    @DisplayName("Should create category using builder")
    void shouldCreateCategoryUsingBuilder(){
        Category category = Category.builder()
                .name("Fish Care")
                .description("Fish health and maintenance")
                .slug("fish-care")
                .build();

        assertNotNull(category);
        assertEquals("Fish Care", category.getName());
        assertEquals("Fish health and maintenance", category.getDescription());
        assertEquals("fish-care", category.getSlug());

        assertNull(category.getId());
        assertEquals(Status.ACTIVE, category.getStatus());
        assertNull(category.getCreatedAt());
        assertNull(category.getUpdatedAt());
    }

    @Test
    @DisplayName("Should update fields using setters")
    void shouldUpdateFieldsUsingSetters(){
        Category category = new Category();

        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        category.setId(id);
        category.setName("Fish Care");
        category.setDescription("Fish health and maintenance");
        category.setSlug("fish-care");
        category.setStatus(Status.INACTIVE);
        category.setCreatedAt(createdAt);
        category.setUpdatedAt(updatedAt);

        assertEquals(id, category.getId());
        assertEquals("Fish Care", category.getName());
        assertEquals("Fish health and maintenance", category.getDescription());
        assertEquals("fish-care", category.getSlug());
        assertEquals(Status.INACTIVE, category.getStatus());
        assertEquals(createdAt, category.getCreatedAt());
        assertEquals(updatedAt, category.getUpdatedAt());
    }

    @Test
    @DisplayName("Should support equals and hashCode correctly")
    void shouldSupportEqualsAndHashCodeCorrectly(){
        UUID id = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        Category category1 = Category.builder()
                .id(id)
                .name("Fish Care")
                .description("Fish health and maintenance")
                .slug("fish-care")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Category category2 = Category.builder()
                .id(id)
                .name("Fish Care")
                .description("Fish health and maintenance")
                .slug("fish-care")
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertEquals(category1, category2);
        assertEquals(category1.hashCode(), category2.hashCode());
    }

    @Test
    @DisplayName("Should support equals and hashCode with different ids")
    void shouldSupportEqualsAndHashCodeWithDifferentIds() {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        Category category1 = Category.builder()
                .id(id1)
                .name("Fish Care")
                .description("Fish health and maintenance")
                .slug("fish-care")
                .createdAt(now)
                .updatedAt(now)
                .build();

        Category category2 = Category.builder()
                .id(id2)
                .name("Fish Care")
                .description("Fish health and maintenance")
                .slug("fish-care")
                .createdAt(now)
                .updatedAt(now)
                .build();

        assertNotEquals(category1, category2);
        assertNotEquals(category1.hashCode(), category2.hashCode());
    }

    @Test
    @DisplayName("Should support toString correctly")
    void shouldSupportToStringCorrectly(){
        Category category = Category.builder()
                .name("Fish Care")
                .description("Fish health and maintenance")
                .slug("fish-care")
                .build();

        String result = category.toString();

        assertNotNull(result);
        assertTrue(result.contains("Fish Care"));
        assertTrue(result.contains("Fish health and maintenance"));
        assertTrue(result.contains("fish-care"));
        assertTrue(result.contains("ACTIVE"));
    }
}
