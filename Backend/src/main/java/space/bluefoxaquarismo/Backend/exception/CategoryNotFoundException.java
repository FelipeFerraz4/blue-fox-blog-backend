package space.bluefoxaquarismo.Backend.exception;

import java.util.UUID;

public class CategoryNotFoundException extends RuntimeException {

    public CategoryNotFoundException(UUID id) {
        super("Category not found with id: " + id);
    }

    public CategoryNotFoundException(String field, String value) {
        super("Category not found with " + field + ": " + value);
    }

    public CategoryNotFoundException(String message) {
        super(message);
    }
}
