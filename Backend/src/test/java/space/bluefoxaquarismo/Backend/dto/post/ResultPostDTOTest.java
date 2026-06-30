package space.bluefoxaquarismo.Backend.dto.post;

import org.junit.jupiter.api.Test;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ResultPostDTOTest {

    @Test
    void shouldCreateResultPostDTO() {

        UUID id = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();

        OffsetDateTime publishedAt = OffsetDateTime.now();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        ResultPostDTO dto = new ResultPostDTO(
                id,
                "Como montar seu primeiro aquário",
                "Guia completo para iniciantes.",
                "https://example.com/image.jpg",
                "como-montar-seu-primeiro-aquario",
                "5 min",
                true,
                categoryId,
                "Aquários Plantados",
                authorId,
                "Leila Cunha Cardoso",
                Status.ACTIVE,
                publishedAt,
                1250L,
                createdAt,
                updatedAt
        );

        assertEquals(id, dto.id());
        assertEquals("Como montar seu primeiro aquário", dto.title());
        assertEquals("Guia completo para iniciantes.", dto.description());
        assertEquals("https://example.com/image.jpg", dto.imageUrl());
        assertEquals("como-montar-seu-primeiro-aquario", dto.slug());
        assertEquals("5 min", dto.readingTime());
        assertTrue(dto.published());
        assertEquals(categoryId, dto.categoryId());
        assertEquals("Aquários Plantados", dto.categoryName());
        assertEquals(authorId, dto.authorId());
        assertEquals("Leila Cunha Cardoso", dto.authorName());
        assertEquals(Status.ACTIVE, dto.status());
        assertEquals(publishedAt, dto.publishedAt());
        assertEquals(1250L, dto.views());
        assertEquals(createdAt, dto.createdAt());
        assertEquals(updatedAt, dto.updatedAt());
    }
}