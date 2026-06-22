package space.bluefoxaquarismo.Backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import space.bluefoxaquarismo.Backend.dto.category.RequestCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.ResultCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.UpdateStatusDTO;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.service.CategoryService;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class CategoryControllerTest {
    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    private UUID id;
    private RequestCategoryDTO requestDTO;
    private ResultCategoryDTO responseDTO;

    @BeforeEach
    void setUp() {
        id = UUID.randomUUID();
        requestDTO = new RequestCategoryDTO(
                "Fish",
                "Fish category",
                "fish"
        );

        OffsetDateTime now = OffsetDateTime.now();

        responseDTO = new ResultCategoryDTO(
                id,
                "Fish",
                "Fish category",
                "fish",
                Status.ACTIVE,
                now,
                now
        );
    }

    @Test
    @DisplayName("Should create category")
    void shouldCreateCategory() {

        when(categoryService.create(requestDTO))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryController.create(requestDTO);

        assertNotNull(result);
        assertEquals(responseDTO, result);

        verify(categoryService)
                .create(requestDTO);
    }

    @Test
    @DisplayName("Should find category by id")
    void shouldFindById() {

        when(categoryService.findById(id))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryController.findById(id);

        assertEquals(responseDTO, result);

        verify(categoryService)
                .findById(id);
    }

    @Test
    @DisplayName("Should find category by name")
    void shouldFindByName() {

        when(categoryService.findByName("Fish"))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryController.findByName("Fish");

        assertEquals(responseDTO, result);

        verify(categoryService)
                .findByName("Fish");
    }

    @Test
    @DisplayName("Should find category by slug")
    void shouldFindBySlug() {

        when(categoryService.findBySlug("fish"))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryController.findBySlug("fish");

        assertEquals(responseDTO, result);

        verify(categoryService)
                .findBySlug("fish");
    }

    @Test
    @DisplayName("Should find all active categories")
    void shouldFindAllActive() {

        List<ResultCategoryDTO> categories =
                List.of(responseDTO);

        when(categoryService.findAllActive())
                .thenReturn(categories);

        List<ResultCategoryDTO> result =
                categoryController.findAllActive();

        assertEquals(1, result.size());

        verify(categoryService)
                .findAllActive();
    }

    @Test
    @DisplayName("Should find all categories")
    void shouldFindAll() {

        List<ResultCategoryDTO> categories =
                List.of(responseDTO);

        when(categoryService.findAll())
                .thenReturn(categories);

        List<ResultCategoryDTO> result =
                categoryController.findAll();

        assertEquals(1, result.size());

        verify(categoryService)
                .findAll();
    }

    @Test
    @DisplayName("Should find categories by status")
    void shouldFindByStatus() {

        List<ResultCategoryDTO> categories =
                List.of(responseDTO);

        when(categoryService.findAllByStatus(Status.ACTIVE))
                .thenReturn(categories);

        List<ResultCategoryDTO> result =
                categoryController.findByStatus(Status.ACTIVE);

        assertEquals(1, result.size());

        verify(categoryService)
                .findAllByStatus(Status.ACTIVE);
    }

    @Test
    @DisplayName("Should update category")
    void shouldUpdateCategory() {

        when(categoryService.update(id, requestDTO))
                .thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryController.update(id, requestDTO);

        assertEquals(responseDTO, result);

        verify(categoryService)
                .update(id, requestDTO);
    }

    @Test
    @DisplayName("Should update category status")
    void shouldUpdateCategoryStatus() {

        UpdateStatusDTO dto =
                new UpdateStatusDTO(
                        Status.ACTIVE
                );

        when(categoryService.updateStatus(
                id,
                Status.ACTIVE
        )).thenReturn(responseDTO);

        ResultCategoryDTO result =
                categoryController.updateStatus(
                        id,
                        dto
                );

        assertEquals(responseDTO, result);

        verify(categoryService)
                .updateStatus(
                        id,
                        Status.ACTIVE
                );
    }

    @Test
    @DisplayName("Should soft delete category")
    void shouldSoftDeleteCategory() {

        doNothing()
                .when(categoryService)
                .softDelete(id);

        categoryController.softDelete(id);

        verify(categoryService)
                .softDelete(id);
    }

    @Test
    @DisplayName("Should hard delete category")
    void shouldHardDeleteCategory() {

        doNothing()
                .when(categoryService)
                .hardDelete(id);

        categoryController.hardDelete(id);

        verify(categoryService)
                .hardDelete(id);
    }
}
