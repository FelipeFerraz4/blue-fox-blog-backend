package space.bluefoxaquarismo.Backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import space.bluefoxaquarismo.Backend.dto.post.RequestPostDTO;
import space.bluefoxaquarismo.Backend.dto.post.ResultPostDTO;
import space.bluefoxaquarismo.Backend.entity.Author;
import space.bluefoxaquarismo.Backend.entity.Category;
import space.bluefoxaquarismo.Backend.entity.Post;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.exception.author.AuthorNotFoundException;
import space.bluefoxaquarismo.Backend.exception.category.CategoryNotFoundException;
import space.bluefoxaquarismo.Backend.exception.post.PostAlreadyExistsException;
import space.bluefoxaquarismo.Backend.exception.post.PostNotFoundException;
import space.bluefoxaquarismo.Backend.mapper.PostMapper;
import space.bluefoxaquarismo.Backend.repository.AuthorRepository;
import space.bluefoxaquarismo.Backend.repository.CategoryRepository;
import space.bluefoxaquarismo.Backend.repository.PostRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @Mock
    private PostMapper postMapper;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private AuthorRepository authorRepository;

    @InjectMocks
    private PostService postService;

    private UUID postId;
    private UUID categoryId;
    private UUID authorId;

    private Post post;
    private Category category;
    private Author author;

    private RequestPostDTO requestDTO;
    private ResultPostDTO responseDTO;

    @BeforeEach
    void setUp() {

        postId = UUID.randomUUID();
        categoryId = UUID.randomUUID();
        authorId = UUID.randomUUID();

        category = new Category();
        category.setId(categoryId);

        author = new Author();
        author.setId(authorId);

        post = new Post();
        post.setId(postId);
        post.setTitle("Meu Post");
        post.setDescription("Descrição");
        post.setImageUrl("image.jpg");
        post.setSlug("meu-post");
        post.setReadingTime("5 min");
        post.setPublished(false);
        post.setStatus(Status.ACTIVE);
        post.setViews(0L);

        requestDTO = new RequestPostDTO(
                "Meu Post",
                "Descrição",
                "image.jpg",
                "meu-post",
                "5 min",
                false,
                categoryId,
                authorId
        );

        responseDTO = new ResultPostDTO(
                postId,
                "Meu Post",
                "Descrição",
                "image.jpg",
                "meu-post",
                "5 min",
                false,
                categoryId,
                "Categoria",
                authorId,
                "Autor",
                Status.ACTIVE,
                null,
                0L,
                null,
                null
        );
    }

    @Test
    void shouldCreatePostSuccessfully() {

        when(postRepository.existsBySlug(anyString()))
                .thenReturn(false);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(postMapper.toEntity(requestDTO))
                .thenReturn(post);

        when(postRepository.save(post))
                .thenReturn(post);

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        ResultPostDTO result =
                postService.create(requestDTO);

        assertEquals(responseDTO, result);

        verify(postRepository).save(post);
        assertEquals(category, post.getCategory());
        assertEquals(author, post.getAuthor());
    }

    @Test
    void shouldThrowWhenSlugAlreadyExists() {

        when(postRepository.existsBySlug("meu-post"))
                .thenReturn(true);

        assertThrows(
                PostAlreadyExistsException.class,
                () -> postService.create(requestDTO)
        );

        verify(postRepository, never()).save(any());
        verify(categoryRepository, never()).findById(any());
        verify(authorRepository, never()).findById(any());
    }

    @Test
    void shouldThrowWhenCategoryNotFoundDuringCreate() {

        when(postRepository.existsBySlug(anyString()))
                .thenReturn(false);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        assertThrows(
                CategoryNotFoundException.class,
                () -> postService.create(requestDTO)
        );

        verify(authorRepository, never()).findById(any());
        verify(postRepository, never()).save(any());
    }

    @Test
    void shouldThrowWhenAuthorNotFoundDuringCreate() {

        when(postRepository.existsBySlug(anyString()))
                .thenReturn(false);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.empty());

        assertThrows(
                AuthorNotFoundException.class,
                () -> postService.create(requestDTO)
        );

        verify(postRepository, never()).save(any());
    }

    @Test
    void shouldSetPublishedAtWhenCreatingPublishedPost() {

        RequestPostDTO publishedDTO = new RequestPostDTO(
                "Meu Post",
                "Descrição",
                "image.jpg",
                "meu-post",
                "5 min",
                true,
                categoryId,
                authorId
        );

        post.setPublished(true);
        post.setPublishedAt(null);

        when(postRepository.existsBySlug(anyString()))
                .thenReturn(false);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(postMapper.toEntity(publishedDTO))
                .thenReturn(post);

        when(postRepository.save(post))
                .thenReturn(post);

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        postService.create(publishedDTO);

        assertNotNull(post.getPublishedAt());

        verify(postRepository).save(post);
    }

    @Test
    void shouldFindPostById() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        ResultPostDTO result =
                postService.findById(postId);

        assertEquals(responseDTO, result);
    }

    @Test
    void shouldThrowWhenPostNotFoundById() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.empty());

        assertThrows(
                PostNotFoundException.class,
                () -> postService.findById(postId)
        );
    }

    @Test
    void shouldFindPostBySlug() {

        when(postRepository.findBySlug("meu-post"))
                .thenReturn(Optional.of(post));

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        ResultPostDTO result =
                postService.findBySlug("meu-post");

        assertEquals(responseDTO, result);
    }

    @Test
    void shouldThrowWhenPostNotFoundBySlug() {

        when(postRepository.findBySlug("meu-post"))
                .thenReturn(Optional.empty());

        assertThrows(
                PostNotFoundException.class,
                () -> postService.findBySlug("meu-post")
        );
    }

    @Test
    void shouldFindAllPosts() {

        when(postRepository.findAll())
                .thenReturn(List.of(post));

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        List<ResultPostDTO> result =
                postService.findAll();

        assertEquals(1, result.size());
        assertEquals(responseDTO, result.getFirst());
    }

    @Test
    void shouldFindAllActivePosts() {

        when(postRepository.findAllByStatus(Status.ACTIVE))
                .thenReturn(List.of(post));

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        List<ResultPostDTO> result =
                postService.findAllActive();

        assertEquals(1, result.size());
        assertEquals(responseDTO, result.getFirst());
    }

    @Test
    void shouldFindAllPostsByStatus() {

        when(postRepository.findAllByStatus(Status.INACTIVE))
                .thenReturn(List.of(post));

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        List<ResultPostDTO> result =
                postService.findAllByStatus(Status.INACTIVE);

        assertEquals(1, result.size());
        assertEquals(responseDTO, result.getFirst());
    }

    @Test
    void shouldUpdatePostSuccessfully() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(postRepository.save(post))
                .thenReturn(post);

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        ResultPostDTO result =
                postService.update(postId, requestDTO);

        assertEquals(responseDTO, result);
    }

    @Test
    void shouldValidateNewSlugDuringUpdate() {

        RequestPostDTO dto = new RequestPostDTO(
                "Novo Post",
                "Nova descrição",
                "new-image.jpg",
                "novo-post",
                "10 min",
                false,
                categoryId,
                authorId
        );

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(postRepository.existsBySlug("novo-post"))
                .thenReturn(false);

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(postRepository.save(any()))
                .thenReturn(post);

        when(postMapper.toResponseDTO(any()))
                .thenReturn(responseDTO);

        postService.update(postId, dto);

        verify(postRepository).existsBySlug("novo-post");
    }

    @Test
    void shouldNotValidateSlugWhenSlugDoesNotChange() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(postRepository.save(any()))
                .thenReturn(post);

        when(postMapper.toResponseDTO(any()))
                .thenReturn(responseDTO);

        postService.update(postId, requestDTO);

        verify(postRepository, never()).existsBySlug(anyString());
    }

    @Test
    void shouldThrowWhenCategoryNotFoundDuringUpdate() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.empty());

        assertThrows(
                CategoryNotFoundException.class,
                () -> postService.update(postId, requestDTO)
        );

        verify(postRepository, never()).save(any());
    }

    @Test
    void shouldThrowWhenAuthorNotFoundDuringUpdate() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.empty());

        assertThrows(
                AuthorNotFoundException.class,
                () -> postService.update(postId, requestDTO)
        );

        verify(postRepository, never()).save(any());
    }

    @Test
    void shouldSetPublishedAtWhenPublishingPost() {

        post.setPublished(false);
        post.setPublishedAt(null);

        RequestPostDTO dto = new RequestPostDTO(
                requestDTO.title(),
                requestDTO.description(),
                requestDTO.imageUrl(),
                requestDTO.slug(),
                requestDTO.readingTime(),
                true,
                categoryId,
                authorId
        );

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(postRepository.save(any()))
                .thenReturn(post);

        when(postMapper.toResponseDTO(any()))
                .thenReturn(responseDTO);

        postService.update(postId, dto);

        assertTrue(post.isPublished());
        assertNotNull(post.getPublishedAt());
    }

    @Test
    void shouldClearPublishedAtWhenUnpublishingPost() {

        post.setPublished(true);
        post.setPublishedAt(OffsetDateTime.now());

        RequestPostDTO dto = new RequestPostDTO(
                requestDTO.title(),
                requestDTO.description(),
                requestDTO.imageUrl(),
                requestDTO.slug(),
                requestDTO.readingTime(),
                false,
                categoryId,
                authorId
        );

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(categoryRepository.findById(categoryId))
                .thenReturn(Optional.of(category));

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(postRepository.save(any()))
                .thenReturn(post);

        when(postMapper.toResponseDTO(any()))
                .thenReturn(responseDTO);

        postService.update(postId, dto);

        assertFalse(post.isPublished());
        assertNull(post.getPublishedAt());
    }

    @Test
    void shouldIncrementViews() {

        post.setViews(10L);

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(postRepository.save(post))
                .thenReturn(post);

        postService.incrementViews(postId);

        assertEquals(11L, post.getViews());

        verify(postRepository).save(post);
    }

    @Test
    void shouldThrowWhenIncrementViewsPostNotFound() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.empty());

        assertThrows(
                PostNotFoundException.class,
                () -> postService.incrementViews(postId)
        );

        verify(postRepository, never()).save(any());
    }

    @Test
    void shouldSoftDeletePost() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        postService.softDelete(postId);

        assertEquals(Status.DELETED, post.getStatus());

        verify(postRepository).save(post);
    }

    @Test
    void shouldThrowWhenSoftDeletePostNotFound() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.empty());

        assertThrows(
                PostNotFoundException.class,
                () -> postService.softDelete(postId)
        );

        verify(postRepository, never()).save(any());
    }

    @Test
    void shouldHardDeletePost() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        postService.hardDelete(postId);

        verify(postRepository).delete(post);
    }

    @Test
    void shouldThrowWhenHardDeletePostNotFound() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.empty());

        assertThrows(
                PostNotFoundException.class,
                () -> postService.hardDelete(postId)
        );

        verify(postRepository, never()).delete(any());
    }

    @Test
    void shouldUpdatePostStatus() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.of(post));

        when(postRepository.save(post))
                .thenReturn(post);

        when(postMapper.toResponseDTO(post))
                .thenReturn(responseDTO);

        ResultPostDTO result =
                postService.updateStatus(postId, Status.INACTIVE);

        assertEquals(Status.INACTIVE, post.getStatus());
        assertEquals(responseDTO, result);

        verify(postRepository).save(post);
    }

    @Test
    void shouldThrowWhenUpdatingStatusOfNonExistingPost() {

        when(postRepository.findById(postId))
                .thenReturn(Optional.empty());

        assertThrows(
                PostNotFoundException.class,
                () -> postService.updateStatus(postId, Status.INACTIVE)
        );

        verify(postRepository, never()).save(any());
    }
}