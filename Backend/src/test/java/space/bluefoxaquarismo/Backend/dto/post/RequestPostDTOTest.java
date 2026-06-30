package space.bluefoxaquarismo.Backend.dto.post;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RequestPostDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void shouldValidateSuccessfully() {

        RequestPostDTO dto = new RequestPostDTO(
                "Como montar seu primeiro aquário",
                "Guia completo para iniciantes.",
                "https://example.com/image.jpg",
                "como-montar-seu-primeiro-aquario",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        Set<ConstraintViolation<RequestPostDTO>> violations =
                validator.validate(dto);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldFailWhenTitleIsBlank() {

        RequestPostDTO dto = new RequestPostDTO(
                "",
                "Descrição",
                "https://example.com/image.jpg",
                "post-valido",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenTitleIsTooShort() {

        RequestPostDTO dto = new RequestPostDTO(
                "Abc",
                "Descrição",
                "https://example.com/image.jpg",
                "post-valido",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        Set<ConstraintViolation<RequestPostDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Post title must be between 5 and 255 characters"
                                ))
        );
    }

    @Test
    void shouldFailWhenDescriptionIsBlank() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "",
                "https://example.com/image.jpg",
                "post-valido",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        Set<ConstraintViolation<RequestPostDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Post description cannot be null or empty"
                                ))
        );
    }

    @Test
    void shouldFailWhenSlugContainsSpaces() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                "https://example.com/image.jpg",
                "meu post",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        Set<ConstraintViolation<RequestPostDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().contains(
                                        "Post slug must contain only lowercase letters"
                                ))
        );
    }

    @Test
    void shouldFailWhenSlugContainsUppercaseLetters() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                "https://example.com/image.jpg",
                "Meu-Post",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenSlugContainsDoubleHyphen() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                "https://example.com/image.jpg",
                "meu--post",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenSlugIsTooShort() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                "https://example.com/image.jpg",
                "ab",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        Set<ConstraintViolation<RequestPostDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Post slug must be between 3 and 255 characters"
                                ))
        );
    }

    @Test
    void shouldFailWhenCategoryIdIsNull() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                "https://example.com/image.jpg",
                "post-valido",
                "5 min",
                true,
                null,
                UUID.randomUUID()
        );

        Set<ConstraintViolation<RequestPostDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Category ID cannot be null"
                                ))
        );
    }

    @Test
    void shouldFailWhenAuthorIdIsNull() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                "https://example.com/image.jpg",
                "post-valido",
                "5 min",
                true,
                UUID.randomUUID(),
                null
        );

        Set<ConstraintViolation<RequestPostDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Author ID cannot be null"
                                ))
        );
    }

    @Test
    void shouldFailWhenTitleIsNull() {

        RequestPostDTO dto = new RequestPostDTO(
                null,
                "Descrição",
                "https://example.com/image.jpg",
                "post-valido",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenDescriptionIsNull() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                null,
                "https://example.com/image.jpg",
                "post-valido",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenImageUrlIsTooLong() {

        String imageUrl = "a".repeat(256);

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                imageUrl,
                "post-valido",
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenReadingTimeIsTooLong() {

        String readingTime = "a".repeat(51);

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                "https://example.com/image.jpg",
                "post-valido",
                readingTime,
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenSlugIsNull() {

        RequestPostDTO dto = new RequestPostDTO(
                "Título válido",
                "Descrição",
                "https://example.com/image.jpg",
                null,
                "5 min",
                true,
                UUID.randomUUID(),
                UUID.randomUUID()
        );

        assertFalse(validator.validate(dto).isEmpty());
    }
}