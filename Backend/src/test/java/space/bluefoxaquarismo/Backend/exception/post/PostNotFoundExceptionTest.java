package space.bluefoxaquarismo.Backend.exception.post;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;

class PostNotFoundExceptionTest {

    @Test
    void shouldCreateExceptionWithIdMessage() {

        UUID id = UUID.randomUUID();

        PostNotFoundException exception =
                new PostNotFoundException(id);

        assertEquals(
                "Post not found with id: " + id,
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithFieldAndValueMessage() {

        String field = "slug";
        String value = "my-first-post";

        PostNotFoundException exception =
                new PostNotFoundException(field, value);

        assertEquals(
                "Post not found with slug: my-first-post",
                exception.getMessage()
        );
    }

    @Test
    void shouldCreateExceptionWithCustomMessage() {

        String message = "Custom post not found message";

        PostNotFoundException exception =
                new PostNotFoundException(message);

        assertEquals(
                message,
                exception.getMessage()
        );
    }
}