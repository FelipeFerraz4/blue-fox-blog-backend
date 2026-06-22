package space.bluefoxaquarismo.Backend.mapper;

import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import space.bluefoxaquarismo.Backend.dto.author.RequestAuthorDTO;
import space.bluefoxaquarismo.Backend.dto.author.ResultAuthorDTO;
import space.bluefoxaquarismo.Backend.entity.Author;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class AuthorMapperTest {

    private final AuthorMapper mapper =
            Mappers.getMapper(AuthorMapper.class);

    @Test
    void shouldMapRequestAuthorDTOToEntity() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Aquarist with over a decade of experience",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leila@email.com"
        );

        Author entity = mapper.toEntity(dto);

        assertNotNull(entity);
        assertEquals(dto.name(), entity.getName());
        assertEquals(dto.bio(), entity.getBio());
        assertEquals(dto.profilePictureUrl(), entity.getProfilePictureUrl());
        assertEquals(dto.slug(), entity.getSlug());
        assertEquals(dto.email(), entity.getEmail());
    }

    @Test
    void shouldMapAuthorToResponseDTO() {

        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        Author author = new Author();

        author.setId(id);
        author.setName("Leila Cunha Cardoso");
        author.setBio("Aquarist with over a decade of experience");
        author.setProfilePictureUrl("https://example.com/profile.jpg");
        author.setSlug("leila-cunha-cardoso");
        author.setEmail("leila@email.com");
        author.setStatus(Status.ACTIVE);
        author.setCreatedAt(createdAt);
        author.setUpdatedAt(updatedAt);

        ResultAuthorDTO dto = mapper.toResponseDTO(author);

        assertNotNull(dto);

        assertEquals(id, dto.id());
        assertEquals(author.getName(), dto.name());
        assertEquals(author.getBio(), dto.bio());
        assertEquals(author.getProfilePictureUrl(), dto.profilePictureUrl());
        assertEquals(author.getSlug(), dto.slug());
        assertEquals(author.getEmail(), dto.email());
        assertEquals(author.getStatus(), dto.status());
        assertEquals(author.getCreatedAt(), dto.createdAt());
        assertEquals(author.getUpdatedAt(), dto.updatedAt());
    }

    @Test
    void shouldReturnNullWhenEntityIsNull() {

        ResultAuthorDTO dto = mapper.toResponseDTO(null);

        assertNull(dto);
    }

    @Test
    void shouldReturnNullWhenDtoIsNull() {

        Author entity = mapper.toEntity(null);

        assertNull(entity);
    }
}