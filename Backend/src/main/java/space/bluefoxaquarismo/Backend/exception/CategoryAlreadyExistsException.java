package space.bluefoxaquarismo.Backend.exception;

import java.util.UUID;

public class CategoryAlreadyExistsException extends RuntimeException {

    public CategoryAlreadyExistsException(UUID id) {
        super("Category already exists with id: " + id);
    }

    public CategoryAlreadyExistsException(String field, String value) {
        super("Category already exists with " + field + ": " + value);
    }

    public CategoryAlreadyExistsException(String message) {
        super(message);
    }
}