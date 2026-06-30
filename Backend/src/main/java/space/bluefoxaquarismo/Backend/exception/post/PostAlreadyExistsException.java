package space.bluefoxaquarismo.Backend.exception.post;

import java.util.UUID;

public class PostAlreadyExistsException extends RuntimeException {

    public PostAlreadyExistsException(UUID id) {
        super("Post already exists with id: " + id);
    }

    public PostAlreadyExistsException(String field, String value) {
        super("Post already exists with " + field + ": " + value);
    }

    public PostAlreadyExistsException(String message) {
        super(message);
    }
}