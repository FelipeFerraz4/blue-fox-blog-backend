package space.bluefoxaquarismo.Backend.exception.author;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthorNotFoundExceptionTest {

    @Test
    void shouldCreateExceptionWithCustomMessage() {

        String message = "Custom author not found message";

        AuthorNotFoundException exception =
                new AuthorNotFoundException(message);

        assertEquals(
                message,
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithIdMessage() {

        UUID id = UUID.randomUUID();

        AuthorNotFoundException exception =
                new AuthorNotFoundException(id);

        assertEquals(
                "Author not found with id: " + id,
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithFieldAndValueMessage() {

        String field = "email";
        String value = "author@email.com";

        AuthorNotFoundException exception =
                new AuthorNotFoundException(field, value);

        assertEquals(
                "Author not found with email: author@email.com",
                exception.getMessage()
        );
    }
}