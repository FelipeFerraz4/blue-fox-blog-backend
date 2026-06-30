package space.bluefoxaquarismo.Backend.exception.post;

import java.util.UUID;

public class PostNotFoundException extends RuntimeException {

    public PostNotFoundException(UUID id) {
        super("Post not found with id: " + id);
    }

    public PostNotFoundException(String field, String value) {
        super("Post not found with " + field + ": " + value);
    }

    public PostNotFoundException(String message) {
        super(message);
    }
}
