package space.bluefoxaquarismo.Backend.exception;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CategoryAlreadyExistsExceptionTest {

    @Test
    void shouldCreateExceptionWithIdMessage() {

        UUID id = UUID.randomUUID();

        CategoryAlreadyExistsException exception =
                new CategoryAlreadyExistsException(id);

        assertEquals(
                "Category already exists with id: " + id,
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithFieldAndValueMessage() {

        String field = "slug";
        String value = "fish-care";

        CategoryAlreadyExistsException exception =
                new CategoryAlreadyExistsException(field, value);

        assertEquals(
                "Category already exists with slug: fish-care",
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithCustomMessage() {

        String message = "Custom category already exists message";

        CategoryAlreadyExistsException exception =
                new CategoryAlreadyExistsException(message);

        assertEquals(
                message,
                exception.getMessage()
        );
    }
}