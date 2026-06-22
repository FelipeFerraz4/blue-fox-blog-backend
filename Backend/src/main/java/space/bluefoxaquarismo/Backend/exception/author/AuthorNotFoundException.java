package space.bluefoxaquarismo.Backend.exception.author;

import java.util.UUID;

public class AuthorNotFoundException extends RuntimeException{
    public AuthorNotFoundException(String message) {
        super(message);
    }

    public AuthorNotFoundException(UUID id) {
        super("Author not found with id: " + id);
    }

    public AuthorNotFoundException(String field, String value) {
        super("Author not found with " + field + ": " + value);
    }
}
