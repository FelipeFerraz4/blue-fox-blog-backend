package space.bluefoxaquarismo.Backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import space.bluefoxaquarismo.Backend.dto.post.RequestPostDTO;
import space.bluefoxaquarismo.Backend.dto.post.ResultPostDTO;
import space.bluefoxaquarismo.Backend.dto.UpdateStatusDTO;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.service.PostService;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class PostControllerTest {

    @Mock
    private PostService postService;

    @InjectMocks
    private PostController postController;

    private UUID id;
    private RequestPostDTO requestDTO;
    private ResultPostDTO responseDTO;

    @BeforeEach
    void setUp() {
        id = UUID.randomUUID();
        UUID categoryId = UUID.randomUUID();
        UUID authorId = UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now();

        requestDTO = new RequestPostDTO(
                "Como montar seu primeiro aquário plantado",
                "Um guia passo a passo completo para iniciantes no aquarismo plantado...",
                "https://example.com/images/aquario-plantado.jpg",
                "como-montar-seu-primeiro-aquario-plantado",
                "5 min",
                true,
                categoryId,
                authorId
        );

        responseDTO = new ResultPostDTO(
                id,
                "Como montar seu primeiro aquário plantado",
                "Um guia passo a passo completo para iniciantes no aquarismo plantado...",
                "https://example.com/images/aquario-plantado.jpg",
                "como-montar-seu-primeiro-aquario-plantado",
                "5 min",
                true,
                categoryId,
                "Freshwater Fish",
                authorId,
                "Leila Cunha Cardoso",
                Status.ACTIVE,
                now,
                150L,
                now,
                now
        );
    }

    @Test
    @DisplayName("Should create post")
    void shouldCreatePost() {
        when(postService.create(requestDTO))
                .thenReturn(responseDTO);

        ResultPostDTO result = postController.create(requestDTO);

        assertNotNull(result);
        assertEquals(responseDTO, result);

        verify(postService).create(requestDTO);
    }

    @Test
    @DisplayName("Should find post by id")
    void shouldFindById() {
        when(postService.findById(id))
                .thenReturn(responseDTO);

        ResultPostDTO result = postController.findById(id);

        assertEquals(responseDTO, result);

        verify(postService).findById(id);
    }

    @Test
    @DisplayName("Should find post by slug")
    void shouldFindBySlug() {
        String slug = "como-montar-seu-primeiro-aquario-plantado";
        when(postService.findBySlug(slug))
                .thenReturn(responseDTO);

        ResultPostDTO result = postController.findBySlug(slug);

        assertEquals(responseDTO, result);

        verify(postService).findBySlug(slug);
    }

    @Test
    @DisplayName("Should find all active posts")
    void shouldFindAllActive() {
        List<ResultPostDTO> posts = List.of(responseDTO);

        when(postService.findAllActive())
                .thenReturn(posts);

        List<ResultPostDTO> result = postController.findAllActive();

        assertEquals(1, result.size());

        verify(postService).findAllActive();
    }

    @Test
    @DisplayName("Should find all posts")
    void shouldFindAll() {
        List<ResultPostDTO> posts = List.of(responseDTO);

        when(postService.findAll())
                .thenReturn(posts);

        List<ResultPostDTO> result = postController.findAll();

        assertEquals(1, result.size());

        verify(postService).findAll();
    }

    @Test
    @DisplayName("Should find posts by status")
    void shouldFindByStatus() {
        List<ResultPostDTO> posts = List.of(responseDTO);

        when(postService.findAllByStatus(Status.ACTIVE))
                .thenReturn(posts);

        List<ResultPostDTO> result = postController.findByStatus(Status.ACTIVE);

        assertEquals(1, result.size());

        verify(postService).findAllByStatus(Status.ACTIVE);
    }

    @Test
    @DisplayName("Should update post")
    void shouldUpdatePost() {
        when(postService.update(id, requestDTO))
                .thenReturn(responseDTO);

        ResultPostDTO result = postController.update(id, requestDTO);

        assertEquals(responseDTO, result);

        verify(postService).update(id, requestDTO);
    }

    @Test
    @DisplayName("Should update post status")
    void shouldUpdatePostStatus() {
        UpdateStatusDTO dto = new UpdateStatusDTO(Status.ACTIVE);

        when(postService.updateStatus(id, Status.ACTIVE))
                .thenReturn(responseDTO);

        ResultPostDTO result = postController.updateStatus(id, dto);

        assertEquals(responseDTO, result);

        verify(postService).updateStatus(id, Status.ACTIVE);
    }

    @Test
    @DisplayName("Should increment post views")
    void shouldIncrementViews() {
        doNothing()
                .when(postService)
                .incrementViews(id);

        postController.incrementViews(id);

        verify(postService).incrementViews(id);
    }

    @Test
    @DisplayName("Should soft delete post")
    void shouldSoftDeletePost() {
        doNothing()
                .when(postService)
                .softDelete(id);

        postController.softDelete(id);

        verify(postService).softDelete(id);
    }

    @Test
    @DisplayName("Should hard delete post")
    void shouldHardDeletePost() {
        doNothing()
                .when(postService)
                .hardDelete(id);

        postController.hardDelete(id);

        verify(postService).hardDelete(id);
    }
}