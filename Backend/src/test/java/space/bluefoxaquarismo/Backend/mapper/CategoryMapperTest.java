package space.bluefoxaquarismo.Backend.mapper;

import org.junit.jupiter.api.Test;
import org.mapstruct.factory.Mappers;
import space.bluefoxaquarismo.Backend.dto.category.RequestCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.ResultCategoryDTO;
import space.bluefoxaquarismo.Backend.entity.Category;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CategoryMapperTest {

    private final CategoryMapper mapper =
            Mappers.getMapper(CategoryMapper.class);

    @Test
    void shouldMapRequestCategoryDTOToEntity() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Category about fish care",
                "fish-care"
        );

        Category entity = mapper.toEntity(dto);

        assertNotNull(entity);
        assertEquals(dto.name(), entity.getName());
        assertEquals(dto.description(), entity.getDescription());
        assertEquals(dto.slug(), entity.getSlug());
    }

    @Test
    void shouldMapCategoryToResponseDTO() {

        UUID id = UUID.randomUUID();
        OffsetDateTime createdAt = OffsetDateTime.now();
        OffsetDateTime updatedAt = OffsetDateTime.now();

        Category category = new Category();

        category.setId(id);
        category.setName("Fish Care");
        category.setDescription("Category about fish care");
        category.setSlug("fish-care");
        category.setStatus(Status.ACTIVE);
        category.setCreatedAt(createdAt);
        category.setUpdatedAt(updatedAt);

        ResultCategoryDTO dto = mapper.toResponseDTO(category);

        assertNotNull(dto);

        assertEquals(category.getId(), dto.id());
        assertEquals(category.getName(), dto.name());
        assertEquals(category.getDescription(), dto.description());
        assertEquals(category.getSlug(), dto.slug());
        assertEquals(category.getStatus(), dto.status());
        assertEquals(category.getCreatedAt(), dto.createdAt());
        assertEquals(category.getUpdatedAt(), dto.updatedAt());
    }

    @Test
    void shouldReturnNullWhenEntityIsNull() {

        ResultCategoryDTO dto = mapper.toResponseDTO(null);

        assertNull(dto);
    }

    @Test
    void shouldReturnNullWhenDtoIsNull() {

        Category entity = mapper.toEntity(null);

        assertNull(entity);
    }
}