package space.bluefoxaquarismo.Backend.exception.author;

import java.util.UUID;

public class AuthorAlreadyExistsException extends RuntimeException {
    public AuthorAlreadyExistsException(String field, String value) {
        super(String.format("Author with %s '%s' already exists.", field, value));
    }

    public AuthorAlreadyExistsException(UUID id) {
        super("Author already exists with id: " + id);
    }

    public AuthorAlreadyExistsException(String message) {
        super(message);
    }
}
