package space.bluefoxaquarismo.Backend.exception.post;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PostAlreadyExistsExceptionTest {

    @Test
    void shouldCreateExceptionWithIdMessage() {

        UUID id = UUID.randomUUID();

        PostAlreadyExistsException exception =
                new PostAlreadyExistsException(id);

        assertEquals(
                "Post already exists with id: " + id,
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithFieldAndValueMessage() {

        String field = "slug";
        String value = "my-first-post";

        PostAlreadyExistsException exception =
                new PostAlreadyExistsException(field, value);

        assertEquals(
                "Post already exists with slug: my-first-post",
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithCustomMessage() {

        String message = "Custom post already exists message";

        PostAlreadyExistsException exception =
                new PostAlreadyExistsException(message);

        assertEquals(
                message,
                exception.getMessage()
        );
    }
}