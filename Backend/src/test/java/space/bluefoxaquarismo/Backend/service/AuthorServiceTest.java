package space.bluefoxaquarismo.Backend.service;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import space.bluefoxaquarismo.Backend.dto.author.RequestAuthorDTO;
import space.bluefoxaquarismo.Backend.dto.author.ResultAuthorDTO;
import space.bluefoxaquarismo.Backend.entity.Author;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.exception.author.AuthorAlreadyExistsException;
import space.bluefoxaquarismo.Backend.exception.author.AuthorNotFoundException;
import space.bluefoxaquarismo.Backend.mapper.AuthorMapper;
import space.bluefoxaquarismo.Backend.repository.AuthorRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;

import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthorServiceTest {

    @Mock
    private AuthorRepository authorRepository;

    @Mock
    private AuthorMapper authorMapper;

    @InjectMocks
    private AuthorService authorService;

    private UUID authorId;
    private Author author;
    private RequestAuthorDTO requestDTO;
    private ResultAuthorDTO responseDTO;

    @BeforeEach
    void setUp() {

        authorId = UUID.randomUUID();

        author = new Author();
        author.setId(authorId);
        author.setName("Leila");
        author.setBio("Bio");
        author.setProfilePictureUrl("url");
        author.setSlug("leila");
        author.setEmail("leila@email.com");
        author.setStatus(Status.ACTIVE);

        requestDTO = new RequestAuthorDTO(
                "Leila",
                "Bio",
                "url",
                "leila",
                "leila@email.com"
        );

        responseDTO = new ResultAuthorDTO(
                authorId,
                "Leila",
                "Bio",
                "url",
                "leila",
                "leila@email.com",
                Status.ACTIVE,
                null,
                null
        );
    }

    @Test
    void shouldCreateAuthorSuccessfully() {

        when(authorRepository.existsByName(anyString())).thenReturn(false);
        when(authorRepository.existsBySlug(anyString())).thenReturn(false);
        when(authorRepository.existsByEmail(anyString())).thenReturn(false);

        when(authorMapper.toEntity(requestDTO))
                .thenReturn(author);

        when(authorRepository.save(author))
                .thenReturn(author);

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        ResultAuthorDTO result =
                authorService.create(requestDTO);

        assertEquals(responseDTO, result);

        verify(authorRepository).save(author);
    }

    @Test
    void shouldThrowExceptionWhenNameAlreadyExists() {

        when(authorRepository.existsByName("Leila"))
                .thenReturn(true);

        assertThrows(
                AuthorAlreadyExistsException.class,
                () -> authorService.create(requestDTO)
        );

        verify(authorRepository, never()).save(any());
    }

    @Test
    void shouldThrowExceptionWhenSlugAlreadyExists() {

        when(authorRepository.existsByName(anyString()))
                .thenReturn(false);

        when(authorRepository.existsBySlug(anyString()))
                .thenReturn(true);

        assertThrows(
                AuthorAlreadyExistsException.class,
                () -> authorService.create(requestDTO)
        );
    }

    @Test
    void shouldThrowExceptionWhenEmailAlreadyExists() {

        when(authorRepository.existsByName(anyString()))
                .thenReturn(false);

        when(authorRepository.existsBySlug(anyString()))
                .thenReturn(false);

        when(authorRepository.existsByEmail(anyString()))
                .thenReturn(true);

        assertThrows(
                AuthorAlreadyExistsException.class,
                () -> authorService.create(requestDTO)
        );
    }

    @Test
    void shouldFindAuthorById() {

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        ResultAuthorDTO result =
                authorService.findById(authorId);

        assertEquals(responseDTO, result);
    }

    @Test
    void shouldThrowWhenAuthorNotFoundById() {

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.empty());

        assertThrows(
                AuthorNotFoundException.class,
                () -> authorService.findById(authorId)
        );
    }

    @Test
    void shouldFindAuthorByName() {

        when(authorRepository.findByName("Leila"))
                .thenReturn(Optional.of(author));

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        ResultAuthorDTO result =
                authorService.findByName("Leila");

        assertEquals(responseDTO, result);
    }

    @Test
    void shouldFindAuthorBySlug() {

        when(authorRepository.findBySlug("leila"))
                .thenReturn(Optional.of(author));

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        ResultAuthorDTO result =
                authorService.findBySlug("leila");

        assertEquals(responseDTO, result);
    }

    @Test
    void shouldFindAuthorByEmail() {

        when(authorRepository.findByEmail("leila@email.com"))
                .thenReturn(Optional.of(author));

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        ResultAuthorDTO result =
                authorService.findByEmail("leila@email.com");

        assertEquals(responseDTO, result);
    }

    @Test
    void shouldFindAllAuthors() {

        when(authorRepository.findAll())
                .thenReturn(List.of(author));

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        List<ResultAuthorDTO> result =
                authorService.findAll();

        assertEquals(1, result.size());
    }

    @Test
    void shouldFindAllActiveAuthors() {

        when(authorRepository.findAllByStatus(Status.ACTIVE))
                .thenReturn(List.of(author));

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        List<ResultAuthorDTO> result =
                authorService.findAllActive();

        assertEquals(1, result.size());
    }

    @Test
    void shouldFindAllAuthorsByStatus() {

        when(authorRepository.findAllByStatus(Status.ACTIVE))
                .thenReturn(List.of(author));

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        List<ResultAuthorDTO> result =
                authorService.findAllByStatus(Status.ACTIVE);

        assertEquals(1, result.size());
    }

    @Test
    void shouldUpdateAuthorSuccessfully() {

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(authorRepository.save(author))
                .thenReturn(author);

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        ResultAuthorDTO result =
                authorService.update(authorId, requestDTO);

        assertEquals(responseDTO, result);
    }

    @Test
    void shouldValidateNewNameDuringUpdate() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "New Name",
                "Bio",
                "url",
                "new_leila",
                "leila2@email.com"
        );

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(authorRepository.existsByName("New Name"))
                .thenReturn(false);

        when(authorRepository.existsBySlug("new_leila"))
                .thenReturn(false);

        when(authorRepository.existsByEmail("leila2@email.com"))
                .thenReturn(false);

        when(authorRepository.save(any()))
                .thenReturn(author);

        when(authorMapper.toResponseDTO(any()))
                .thenReturn(responseDTO);

        authorService.update(authorId, dto);

        verify(authorRepository).existsByName("New Name");
        verify(authorRepository).existsBySlug("new_leila");
        verify(authorRepository).existsByEmail("leila2@email.com");
    }

    @Test
    void shouldSoftDeleteAuthor() {

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        authorService.softDelete(authorId);

        assertEquals(Status.DELETED, author.getStatus());

        verify(authorRepository).save(author);
    }

    @Test
    void shouldHardDeleteAuthor() {

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        authorService.hardDelete(authorId);

        verify(authorRepository).delete(author);
    }

    @Test
    void shouldUpdateAuthorStatus() {

        when(authorRepository.findById(authorId))
                .thenReturn(Optional.of(author));

        when(authorRepository.save(author))
                .thenReturn(author);

        when(authorMapper.toResponseDTO(author))
                .thenReturn(responseDTO);

        authorService.updateStatus(authorId, Status.INACTIVE);

        assertEquals(Status.INACTIVE, author.getStatus());
    }
}