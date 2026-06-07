package space.bluefoxaquarismo.Backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import space.bluefoxaquarismo.Backend.dto.category.RequestCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.ResultCategoryDTO;
import space.bluefoxaquarismo.Backend.entity.Category;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.exception.CategoryAlreadyExistsException;
import space.bluefoxaquarismo.Backend.exception.CategoryNotFoundException;
import space.bluefoxaquarismo.Backend.mapper.CategoryMapper;
import space.bluefoxaquarismo.Backend.repository.CategoryRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private CategoryMapper categoryMapper;

    @InjectMocks
    private CategoryService categoryService;

    private UUID categoryId;
    private Category category;
    private RequestCategoryDTO requestDTO;
    private ResultCategoryDTO responseDTO;

    @BeforeEach
    void setUp() {

        categoryId = UUID.randomUUID();

        category = Category.builder()
                .id(categoryId)
                .name("Fish Care")
                .description("Fish care category")
                .slug("fish-care")
                .status(Status.ACTIVE)
                .build();

        requestDTO = new RequestCategoryDTO(
                "Fish Care",
                "Fish care category",
                "fish-care"
        );

        responseDTO = new ResultCategoryDTO(
                categoryId,
                "Fish Care",
                "Fish care category",
                "fish-care"
        );
    }

    @Test
    void shouldCreateCategorySuccessfully() {

        when(categoryRepository.existsByName(requestDTO.name()))
                .thenReturn(false);

        when(categoryRepository.existsBySlug(requestDTO.slug()))
                .thenReturn(false);

        when(categoryMapper.toEntity(requestDTO))
                .thenReturn(category);

        when(categoryRepository.save(category))
                .thenReturn(category);

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        ResultCategoryDTO result = categoryService.create(requestDTO);

        assertNotNull(result);
        assertEquals(responseDTO, result);

        verify(categoryRepository).existsByName(requestDTO.name());
        verify(categoryRepository).existsBySlug(requestDTO.slug());
        verify(categoryMapper).toEntity(requestDTO);
        verify(categoryRepository).save(category);
        verify(categoryMapper).toResponseDTO(category);
    }

    @Test
    void shouldThrowExceptionWhenCreatingCategoryWithDuplicateName() {

        when(categoryRepository.existsByName(requestDTO.name()))
                .thenReturn(true);

        assertThrows(
                CategoryAlreadyExistsException.class,
                () -> categoryService.create(requestDTO)
        );

        verify(categoryRepository).existsByName(requestDTO.name());

        verify(categoryRepository, never())
                .save(any());
    }

    @Test
    void shouldThrowExceptionWhenCreatingCategoryWithDuplicateSlug() {

        when(categoryRepository.existsByName(requestDTO.name()))
                .thenReturn(false);

        when(categoryRepository.existsBySlug(requestDTO.slug()))
                .thenReturn(true);

        assertThrows(
                CategoryAlreadyExistsException.class,
                () -> categoryService.create(requestDTO)
        );

        verify(categoryRepository).existsBySlug(requestDTO.slug());

        verify(categoryRepository, never())
                .save(any());
    }

    @Test
    void shouldFindCategoryByIdSuccessfully() {

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        ResultCategoryDTO result = categoryService.findById(categoryId);

        assertNotNull(result);
        assertEquals(responseDTO, result);

        verify(categoryRepository).findById(categoryId);
        verify(categoryMapper).toResponseDTO(category);
    }

    @Test
    void shouldThrowExceptionWhenCategoryIdNotFound() {

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        assertThrows(
                CategoryNotFoundException.class,
                () -> categoryService.findById(categoryId)
        );

        verify(categoryRepository).findById(categoryId);
    }

    @Test
    void shouldFindCategoryByNameSuccessfully() {

        when(categoryRepository.findByName(category.getName()))
                .thenReturn(Optional.of(category));

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryService.findByName(category.getName());

        assertNotNull(result);
        assertEquals(responseDTO, result);
    }

    @Test
    void shouldThrowExceptionWhenCategoryNameNotFound() {

        when(categoryRepository.findByName(category.getName()))
                .thenReturn(Optional.empty());

        assertThrows(
                CategoryNotFoundException.class,
                () -> categoryService.findByName(category.getName())
        );
    }

    @Test
    void shouldFindCategoryBySlugSuccessfully() {

        when(categoryRepository.findBySlug(category.getSlug()))
                .thenReturn(Optional.of(category));

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryService.findBySlug(category.getSlug());

        assertNotNull(result);
        assertEquals(responseDTO, result);
    }

    @Test
    void shouldThrowExceptionWhenCategorySlugNotFound() {

        when(categoryRepository.findBySlug(category.getSlug()))
                .thenReturn(Optional.empty());

        assertThrows(
                CategoryNotFoundException.class,
                () -> categoryService.findBySlug(category.getSlug())
        );
    }

    @Test
    void shouldFindAllCategoriesSuccessfully() {

        when(categoryRepository.findAll())
                .thenReturn(List.of(category));

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        List<ResultCategoryDTO> result = categoryService.findAll();

        assertEquals(1, result.size());
        assertEquals(responseDTO, result.getFirst());
    }

    @Test
    void shouldFindAllActiveCategoriesSuccessfully() {

        when(categoryRepository.findAllByStatus(Status.ACTIVE))
                .thenReturn(List.of(category));

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        List<ResultCategoryDTO> result =
                categoryService.findAllActive();

        assertEquals(1, result.size());
        assertEquals(responseDTO, result.getFirst());
    }

    @Test
    void shouldFindAllCategoriesByStatusSuccessfully() {

        when(categoryRepository.findAllByStatus(Status.ACTIVE))
                .thenReturn(List.of(category));

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        List<ResultCategoryDTO> result =
                categoryService.findAllByStatus(Status.ACTIVE);

        assertEquals(1, result.size());
        assertEquals(responseDTO, result.getFirst());
    }

    @Test
    void shouldUpdateCategorySuccessfully() {

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(categoryRepository.save(category))
                .thenReturn(category);

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryService.update(categoryId, requestDTO);

        assertNotNull(result);
        assertEquals(responseDTO, result);

        verify(categoryRepository).save(category);
    }

    @Test
    void shouldValidateNameDuringUpdate() {

        RequestCategoryDTO updatedDTO = new RequestCategoryDTO(
                "New Name",
                "Description",
                "fish-care"
        );

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(categoryRepository.existsByName("New Name"))
                .thenReturn(true);

        assertThrows(
                CategoryAlreadyExistsException.class,
                () -> categoryService.update(categoryId, updatedDTO)
        );
    }

    @Test
    void shouldValidateSlugDuringUpdate() {

        RequestCategoryDTO updatedDTO = new RequestCategoryDTO(
                "Fish Care",
                "Description",
                "new-slug"
        );

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(categoryRepository.existsBySlug("new-slug"))
                .thenReturn(true);

        assertThrows(
                CategoryAlreadyExistsException.class,
                () -> categoryService.update(categoryId, updatedDTO)
        );
    }

    @Test
    void shouldSoftDeleteCategorySuccessfully() {

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(categoryRepository.save(category))
                .thenReturn(category);

        categoryService.softDelete(categoryId);

        assertEquals(Status.DELETED, category.getStatus());

        verify(categoryRepository).save(category);
    }

    @Test
    void shouldHardDeleteCategorySuccessfully() {

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        categoryService.hardDelete(categoryId);

        verify(categoryRepository).delete(category);
    }

    @Test
    void shouldUpdateCategoryStatusSuccessfully() {

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(categoryRepository.save(category))
                .thenReturn(category);

        when(categoryMapper.toResponseDTO(category))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryService.updateStatus(categoryId, Status.INACTIVE);

        assertNotNull(result);
        assertEquals(responseDTO, result);

        assertEquals(Status.INACTIVE, category.getStatus());

        verify(categoryRepository).save(category);
    }
}