package space.bluefoxaquarismo.Backend.dto.author;

import org.junit.jupiter.api.Test;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ResultAuthorDTOTest {

    @Test
    void shouldCreateResultAuthorDTO() {

        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        ResultAuthorDTO dto = new ResultAuthorDTO(
                id,
                "Leila Cunha Cardoso",
                "Aquarist with over a decade of experience",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leila@email.com",
                Status.ACTIVE,
                createdAt,
                updatedAt
        );

        assertEquals(id, dto.id());
        assertEquals("Leila Cunha Cardoso", dto.name());
        assertEquals("Aquarist with over a decade of experience", dto.bio());
        assertEquals("https://example.com/profile.jpg", dto.profilePictureUrl());
        assertEquals("leila-cunha-cardoso", dto.slug());
        assertEquals("leila@email.com", dto.email());
        assertEquals(Status.ACTIVE, dto.status());
        assertEquals(createdAt, dto.createdAt());
        assertEquals(updatedAt, dto.updatedAt());
    }
}