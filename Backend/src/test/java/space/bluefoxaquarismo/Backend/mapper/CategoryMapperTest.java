package space.bluefoxaquarismo.Backend.mapper;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import space.bluefoxaquarismo.Backend.dto.category.RequestCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.ResultCategoryDTO;
import space.bluefoxaquarismo.Backend.entity.Category;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class CategoryMapperTest {

    private CategoryMapper categoryMapper;

    @BeforeEach
    void setUp() {
        categoryMapper = new CategoryMapper();
    }

    @Test
    void shouldConvertRequestCategoryDTOToEntity() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Category about fish care",
                "fish-care"
        );

        Category entity = categoryMapper.toEntity(dto);

        assertNotNull(entity);

        assertEquals(dto.name(), entity.getName());
        assertEquals(dto.description(), entity.getDescription());
        assertEquals(dto.slug(), entity.getSlug());
    }

    @Test
    void shouldConvertCategoryEntityToResponseDTO() {

        UUID id = UUID.randomUUID();

        Category entity = Category.builder()
                .id(id)
                .name("Fish Care")
                .description("Category about fish care")
                .slug("fish-care")
                .build();

        ResultCategoryDTO dto = categoryMapper.toResponseDTO(entity);

        assertNotNull(dto);

        assertEquals(entity.getId(), dto.id());
        assertEquals(entity.getName(), dto.name());
        assertEquals(entity.getDescription(), dto.description());
        assertEquals(entity.getSlug(), dto.slug());
    }

    @Test
    void shouldReturnEntityWithNullFieldsWhenDtoFieldsAreNull() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                null,
                null,
                null
        );

        Category entity = categoryMapper.toEntity(dto);

        assertNotNull(entity);

        assertNull(entity.getName());
        assertNull(entity.getDescription());
        assertNull(entity.getSlug());
    }

    @Test
    void shouldReturnResponseDTOWithNullFieldsWhenEntityFieldsAreNull() {

        Category entity = Category.builder()
                .id(null)
                .name(null)
                .description(null)
                .slug(null)
                .build();

        ResultCategoryDTO dto = categoryMapper.toResponseDTO(entity);

        assertNotNull(dto);

        assertNull(dto.id());
        assertNull(dto.name());
        assertNull(dto.description());
        assertNull(dto.slug());
    }
}