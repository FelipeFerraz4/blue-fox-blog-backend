package space.bluefoxaquarismo.Backend.dto.category;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class RequestCategoryDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void shouldValidateSuccessfully() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Category about fish care",
                "fish-care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldFailWhenNameIsBlank() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "",
                "Category about fish care",
                "fish-care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugContainsSpaces() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Category about fish care",
                "fish care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().contains("Category slug must contain only lowercase letters"))
        );
    }

    @Test
    void shouldFailWhenSlugContainsUppercaseLetters() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Category about fish care",
                "Fish-Care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugStartsWithHyphen() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Category about fish care",
                "-fish-care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugEndsWithHyphen() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Category about fish care",
                "fish-care-"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugContainsDoubleHyphen() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Category about fish care",
                "fish--care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenDescriptionIsBlank() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "",
                "fish-care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().equals(
                                        "Category description cannot be null or empty"
                                ))
        );
    }

    @Test
    void shouldFailWhenNameIsTooShort() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "AB",
                "Description",
                "fish-care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().contains(
                                        "Category name must be between 3 and 255 characters"
                                ))
        );
    }

    @Test
    void shouldFailWhenSlugIsTooShort() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Description",
                "ab"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().contains(
                                        "Category slug must be between 3 and 255 characters"
                                ))
        );
    }

    @Test
    void shouldFailWhenNameIsNull() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                null,
                "Description",
                "fish-care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugIsNull() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                "Description",
                null
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenDescriptionIsNull() {

        RequestCategoryDTO dto = new RequestCategoryDTO(
                "Fish Care",
                null,
                "fish-care"
        );

        Set<ConstraintViolation<RequestCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }
}