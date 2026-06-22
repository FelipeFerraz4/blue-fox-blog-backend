package space.bluefoxaquarismo.Backend.exception;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import space.bluefoxaquarismo.Backend.dto.error.ErrorResponseDTO;
import space.bluefoxaquarismo.Backend.exception.category.CategoryAlreadyExistsException;
import space.bluefoxaquarismo.Backend.exception.category.CategoryNotFoundException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler globalExceptionHandler;
    private HttpServletRequest request;

    @BeforeEach
    void setUp() {
        globalExceptionHandler = new GlobalExceptionHandler();

        request = mock(HttpServletRequest.class);
        when(request.getRequestURI())
                .thenReturn("/api/v1/categories/123");
    }

    @Test
    @DisplayName("Should handle category not found exception")
    void shouldHandleCategoryNotFoundException() {
        CategoryNotFoundException exception =
                new CategoryNotFoundException("Category not found");

        ResponseEntity<ErrorResponseDTO> response =
                globalExceptionHandler.handleCategoryNotFound(
                        exception,
                        request
                );

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());

        ErrorResponseDTO body = response.getBody();

        assertNotNull(body);
        assertEquals(404, body.status());
        assertEquals("Not Found", body.error());
        assertEquals("Category not found", body.message());
        assertEquals("/api/v1/categories/123", body.path());
        assertNull(body.details());
    }

    @Test
    @DisplayName("Should handle category already exists exception")
    void shouldHandleCategoryAlreadyExistsException() {
        CategoryAlreadyExistsException exception =
                new CategoryAlreadyExistsException(
                        "Category already exists"
                );

        ResponseEntity<ErrorResponseDTO> response =
                globalExceptionHandler.handleCategoryAlreadyExists(
                        exception,
                        request
                );

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());

        ErrorResponseDTO body = response.getBody();

        assertNotNull(body);
        assertEquals(409, body.status());
        assertEquals("Conflict", body.error());
        assertEquals("Category already exists", body.message());
        assertEquals("/api/v1/categories/123", body.path());
        assertNull(body.details());
    }

    @Test
    @DisplayName("Should handle validation errors")
    void shouldHandleValidationErrors() {

        MethodArgumentNotValidException exception =
                mock(MethodArgumentNotValidException.class);

        BindingResult bindingResult =
                mock(BindingResult.class);

        when(exception.getBindingResult())
                .thenReturn(bindingResult);

        FieldError fieldError = new FieldError(
                "category",
                "name",
                "Name is required"
        );

        FieldError slugError = new FieldError(
                "category",
                "slug",
                "Slug is required"
        );

        when(bindingResult.getFieldErrors())
                .thenReturn(List.of(fieldError, slugError));

        ResponseEntity<ErrorResponseDTO> response =
                globalExceptionHandler.handleValidationErrors(
                        exception,
                        request
                );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

        ErrorResponseDTO body = response.getBody();

        assertNotNull(body);

        assertEquals(400, body.status());
        assertEquals("Validation Error", body.error());
        assertEquals(
                "One or more fields are invalid",
                body.message()
        );
        assertEquals(
                "/api/v1/categories/123",
                body.path()
        );

        assertNotNull(body.details());
        assertEquals(
                "Name is required",
                body.details().get("name")
        );

        assertEquals(
                "Slug is required",
                body.details().get("slug")
        );

        assertEquals(2, body.details().size());
    }

    @Test
    @DisplayName("Should handle invalid request parameter type")
    void shouldHandleTypeMismatchException() {

        MethodArgumentTypeMismatchException exception =
                mock(MethodArgumentTypeMismatchException.class);

        when(exception.getName())
                .thenReturn("status");

        ResponseEntity<ErrorResponseDTO> response =
                globalExceptionHandler.handleTypeMismatch(
                        exception,
                        request
                );

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());

        ErrorResponseDTO body = response.getBody();

        assertNotNull(body);
        assertEquals(400, body.status());
        assertEquals("Bad Request", body.error());
        assertEquals(
                "Invalid value for parameter: status",
                body.message()
        );
    }

    @Test
    @DisplayName("Should handle generic exception")
    void shouldHandleGenericException() {
        Exception exception =
                new Exception("Unexpected error");

        ResponseEntity<ErrorResponseDTO> response =
                globalExceptionHandler.handleGenericException(
                        exception,
                        request
                );

        assertEquals(
                HttpStatus.INTERNAL_SERVER_ERROR,
                response.getStatusCode()
        );

        ErrorResponseDTO body = response.getBody();

        assertNotNull(body);
        assertEquals(500, body.status());
        assertEquals("Internal Server Error", body.error());
        assertEquals("Unexpected error", body.message());
        assertEquals("/api/v1/categories/123", body.path());
        assertNull(body.details());
    }
}