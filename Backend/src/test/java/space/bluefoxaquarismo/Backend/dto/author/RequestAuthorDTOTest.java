package space.bluefoxaquarismo.Backend.dto.author;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RequestAuthorDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void shouldValidateSuccessfully() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Aquarist with over a decade of experience",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leila@email.com"
        );

        Set<ConstraintViolation<RequestAuthorDTO>> violations =
                validator.validate(dto);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldFailWhenNameIsBlank() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "",
                "Bio",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leila@email.com"
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenNameIsTooShort() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "AB",
                "Bio",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leila@email.com"
        );

        Set<ConstraintViolation<RequestAuthorDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Author name must be between 3 and 255 characters"
                                ))
        );
    }

    @Test
    void shouldFailWhenBioIsBlank() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "",
                "https://example.com/profile.jpg",
                "leila-cunha-cardoso",
                "leila@email.com"
        );

        Set<ConstraintViolation<RequestAuthorDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Author biography cannot be null or empty"
                                ))
        );
    }

    @Test
    void shouldFailWhenProfilePictureUrlIsBlank() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "",
                "leila-cunha-cardoso",
                "leila@email.com"
        );

        Set<ConstraintViolation<RequestAuthorDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugContainsSpaces() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "https://example.com/profile.jpg",
                "leila cunha",
                "leila@email.com"
        );

        Set<ConstraintViolation<RequestAuthorDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().contains(
                                        "Author slug must contain only lowercase letters"
                                ))
        );
    }

    @Test
    void shouldFailWhenSlugContainsUppercaseLetters() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "https://example.com/profile.jpg",
                "Leila-Cunha",
                "leila@email.com"
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenSlugContainsDoubleHyphen() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "https://example.com/profile.jpg",
                "leila--cunha",
                "leila@email.com"
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenSlugIsTooShort() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "https://example.com/profile.jpg",
                "ab",
                "leila@email.com"
        );

        Set<ConstraintViolation<RequestAuthorDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Author slug must be between 3 and 255 characters"
                                ))
        );
    }

    @Test
    void shouldFailWhenEmailIsInvalid() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "https://example.com/profile.jpg",
                "leila-cunha",
                "invalid-email"
        );

        Set<ConstraintViolation<RequestAuthorDTO>> violations =
                validator.validate(dto);

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Email must be a valid email address"
                                ))
        );
    }

    @Test
    void shouldFailWhenEmailIsBlank() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "https://example.com/profile.jpg",
                "leila-cunha",
                ""
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenNameIsNull() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                null,
                "Bio",
                "https://example.com/profile.jpg",
                "leila-cunha",
                "leila@email.com"
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenBioIsNull() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                null,
                "https://example.com/profile.jpg",
                "leila-cunha",
                "leila@email.com"
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenProfilePictureUrlIsNull() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                null,
                "leila-cunha",
                "leila@email.com"
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenSlugIsNull() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "https://example.com/profile.jpg",
                null,
                "leila@email.com"
        );

        assertFalse(validator.validate(dto).isEmpty());
    }

    @Test
    void shouldFailWhenEmailIsNull() {

        RequestAuthorDTO dto = new RequestAuthorDTO(
                "Leila Cunha Cardoso",
                "Bio",
                "https://example.com/profile.jpg",
                "leila-cunha",
                null
        );

        assertFalse(validator.validate(dto).isEmpty());
    }
}