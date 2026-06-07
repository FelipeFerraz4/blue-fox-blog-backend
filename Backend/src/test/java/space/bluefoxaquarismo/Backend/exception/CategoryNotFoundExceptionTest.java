package space.bluefoxaquarismo.Backend.exception;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CategoryNotFoundExceptionTest {

    @Test
    void shouldCreateExceptionWithIdMessage() {

        UUID id = UUID.randomUUID();

        CategoryNotFoundException exception =
                new CategoryNotFoundException(id);

        assertEquals(
                "Category not found with id: " + id,
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithFieldAndValueMessage() {

        String field = "slug";
        String value = "fish-care";

        CategoryNotFoundException exception =
                new CategoryNotFoundException(field, value);

        assertEquals(
                "Category not found with slug: fish-care",
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithCustomMessage() {

        String message = "Custom category not found message";

        CategoryNotFoundException exception =
                new CategoryNotFoundException(message);

        assertEquals(
                message,
                exception.getMessage()
        );
    }
}