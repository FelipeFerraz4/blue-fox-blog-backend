package space.bluefoxaquarismo.Backend.dto.category;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.time.OffsetDateTime;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class ResultCategoryDTOTest {

    private Validator validator;

    private final OffsetDateTime now = OffsetDateTime.now();

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
                "fish-care",
                Status.ACTIVE,
                now,
                now
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
                "fish-care",
                Status.ACTIVE,
                now,
                now
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
                "fish-care",
                Status.ACTIVE,
                now,
                now
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
                "fish-care",
                Status.ACTIVE,
                now,
                now
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
                "fish-care",
                Status.ACTIVE,
                now,
                now
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
                "fish care",
                Status.ACTIVE,
                now,
                now
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
                "Fish-Care",
                Status.ACTIVE,
                now,
                now
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
                "-fish-care",
                Status.ACTIVE,
                now,
                now
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
                "fish-care-",
                Status.ACTIVE,
                now,
                now
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
                "fish--care",
                Status.ACTIVE,
                now,
                now
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenDescriptionIsNull() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                null,
                "fish-care",
                Status.ACTIVE,
                now,
                now
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());

        assertTrue(
                violations.stream()
                        .anyMatch(v ->
                                v.getMessage().contains(
                                        "Category description cannot be null or empty"
                                ))
        );
    }

    @Test
    void shouldFailWhenNameIsNull() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                null,
                "Category about fish care",
                "fish-care",
                Status.ACTIVE,
                now,
                now
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugIsNull() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "Category about fish care",
                null,
                Status.ACTIVE,
                now,
                now
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
                validator.validate(dto);

        assertFalse(violations.isEmpty());
    }

    @Test
    void shouldFailWhenSlugIsTooShort() {

        ResultCategoryDTO dto = new ResultCategoryDTO(
                UUID.randomUUID(),
                "Fish Care",
                "Category about fish care",
                "ab",
                Status.ACTIVE,
                now,
                now
        );

        Set<ConstraintViolation<ResultCategoryDTO>> violations =
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
}