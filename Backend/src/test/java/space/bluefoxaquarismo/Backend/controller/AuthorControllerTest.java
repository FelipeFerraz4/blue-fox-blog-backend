package space.bluefoxaquarismo.Backend.controller;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import space.bluefoxaquarismo.Backend.dto.author.RequestAuthorDTO;
import space.bluefoxaquarismo.Backend.dto.author.ResultAuthorDTO;
import space.bluefoxaquarismo.Backend.dto.UpdateStatusDTO;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.service.AuthorService;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthorControllerTest {

    @Mock
    private AuthorService authorService;

    @InjectMocks
    private AuthorController authorController;

    private UUID id;
    private RequestAuthorDTO requestDTO;
    private ResultAuthorDTO responseDTO;

    @BeforeEach
    void setUp() {
        id = UUID.randomUUID();
        requestDTO = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Aquarist with over a decade of experience.",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leilacunha@gmail.com"
        );

        OffsetDateTime now = OffsetDateTime.now();

        responseDTO = new ResultAuthorDTO(
                id,
                "Leila Cunha Cardoso",
                "Aquarist with over a decade of experience.",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leilacunha@gmail.com",
                Status.ACTIVE,
                now,
                now
        );
    }

    @Test
    @DisplayName("Should create author")
    void shouldCreateAuthor() {
        when(authorService.create(requestDTO))
                .thenReturn(responseDTO);

        ResultAuthorDTO result = authorController.create(requestDTO);

        assertNotNull(result);
        assertEquals(responseDTO, result);

        verify(authorService).create(requestDTO);
    }

    @Test
    @DisplayName("Should find author by id")
    void shouldFindById() {
        when(authorService.findById(id))
                .thenReturn(responseDTO);

        ResultAuthorDTO result = authorController.findById(id);

        assertEquals(responseDTO, result);

        verify(authorService).findById(id);
    }

    @Test
    @DisplayName("Should find author by name")
    void shouldFindByName() {
        String name = "Leila Cunha Cardoso";
        when(authorService.findByName(name))
                .thenReturn(responseDTO);

        ResultAuthorDTO result = authorController.findByName(name);

        assertEquals(responseDTO, result);

        verify(authorService).findByName(name);
    }

    @Test
    @DisplayName("Should find author by slug")
    void shouldFindBySlug() {
        String slug = "leila-cunha-cardoso";
        when(authorService.findBySlug(slug))
                .thenReturn(responseDTO);

        ResultAuthorDTO result = authorController.findBySlug(slug);

        assertEquals(responseDTO, result);

        verify(authorService).findBySlug(slug);
    }

    @Test
    @DisplayName("Should find author by email")
    void shouldFindByEmail() {
        String email = "leilacunha@gmail.com";
        when(authorService.findByEmail(email))
                .thenReturn(responseDTO);

        ResultAuthorDTO result = authorController.findByEmail(email);

        assertEquals(responseDTO, result);

        verify(authorService).findByEmail(email);
    }

    @Test
    @DisplayName("Should find all active authors")
    void shouldFindAllActive() {
        List<ResultAuthorDTO> authors = List.of(responseDTO);

        when(authorService.findAllActive())
                .thenReturn(authors);

        List<ResultAuthorDTO> result = authorController.findAllActive();

        assertEquals(1, result.size());

        verify(authorService).findAllActive();
    }

    @Test
    @DisplayName("Should find all authors")
    void shouldFindAll() {
        List<ResultAuthorDTO> authors = List.of(responseDTO);

        when(authorService.findAll())
                .thenReturn(authors);

        List<ResultAuthorDTO> result = authorController.findAll();

        assertEquals(1, result.size());

        verify(authorService).findAll();
    }

    @Test
    @DisplayName("Should find authors by status")
    void shouldFindByStatus() {
        List<ResultAuthorDTO> authors = List.of(responseDTO);

        when(authorService.findAllByStatus(Status.ACTIVE))
                .thenReturn(authors);

        List<ResultAuthorDTO> result = authorController.findByStatus(Status.ACTIVE);

        assertEquals(1, result.size());

        verify(authorService).findAllByStatus(Status.ACTIVE);
    }

    @Test
    @DisplayName("Should update author")
    void shouldUpdateAuthor() {
        when(authorService.update(id, requestDTO))
                .thenReturn(responseDTO);

        ResultAuthorDTO result = authorController.update(id, requestDTO);

        assertEquals(responseDTO, result);

        verify(authorService).update(id, requestDTO);
    }

    @Test
    @DisplayName("Should update author status")
    void shouldUpdateAuthorStatus() {
        UpdateStatusDTO dto = new UpdateStatusDTO(Status.ACTIVE);

        when(authorService.updateStatus(id, Status.ACTIVE))
                .thenReturn(responseDTO);

        ResultAuthorDTO result = authorController.updateStatus(id, dto);

        assertEquals(responseDTO, result);

        verify(authorService).updateStatus(id, Status.ACTIVE);
    }

    @Test
    @DisplayName("Should soft delete author")
    void shouldSoftDeleteAuthor() {
        doNothing()
                .when(authorService)
                .softDelete(id);

        authorController.softDelete(id);

        verify(authorService).softDelete(id);
    }

    @Test
    @DisplayName("Should hard delete author")
    void shouldHardDeleteAuthor() {
        doNothing()
                .when(authorService)
                .hardDelete(id);

        authorController.hardDelete(id);

        verify(authorService).hardDelete(id);
    }
}