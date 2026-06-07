package space.bluefoxaquarismo.Backend.dto.category;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ResultCategoryDTOTest {

    private Validator validator;

    @BeforeEach
    void setUp() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();
    }

    @Test
    void shouldValidateSuccessfully() {
        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "Category about fish care",
                "fish-care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertTrue(violations.isEmpty());
    }

    @Test
    void shouldFailWhenIdIsNull() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                null,
                "Fish Care",
                "Category about fish care",
                "fish-care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().contains("Category id cannot be null"))
        );
    }

    @Test
    void shouldFailWhenNameIsBlank() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "",
                "Category about fish care",
                "fish-care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenNameIsTooShort() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "AB",
                "Category about fish care",
                "fish-care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().contains("Category name must be between 3 and 255 characters"))
        );
    }

    @Test
    void shouldFailWhenDescriptionIsBlank() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "",
                "fish-care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugContainsSpaces() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "Category about fish care",
                "fish care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
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

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "Category about fish care",
                "Fish-Care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugStartsWithHyphen() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "Category about fish care",
                "-fish-care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugEndsWithHyphen() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "Category about fish care",
                "fish-care-"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugContainsDoubleHyphen() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "Category about fish care",
                "fish--care"
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }
}