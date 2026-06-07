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
}