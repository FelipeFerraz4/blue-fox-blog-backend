package space.bluefoxaquarismo.Backend.exception.author;

import org.junit.jupiter.api.Test;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class AuthorAlreadyExistsExceptionTest {

    @Test
    void shouldCreateExceptionWithFieldAndValueMessage() {

        String field = "email";
        String value = "author@email.com";

        AuthorAlreadyExistsException exception =
                new AuthorAlreadyExistsException(field, value);

        assertEquals(
                "Author with email 'author@email.com' already exists.",
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithIdMessage() {

        UUID id = UUID.randomUUID();

        AuthorAlreadyExistsException exception =
                new AuthorAlreadyExistsException(id);

        assertEquals(
                "Author already exists with id: " + id,
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithCustomMessage() {

        String message = "Custom author already exists message";

        AuthorAlreadyExistsException exception =
                new AuthorAlreadyExistsException(message);

        assertEquals(
                message,
                exception.getMessage()
        );
    }
}