package space.bluefoxaquarismo.Backend.dto.error;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class ErrorResponseDTOTest {

    @Test
    @DisplayName("Should create error response dto")
    void shouldCreateErrorResponseDTO() {

        LocalDateTime timestamp = LocalDateTime.now();

        Map<String, String> details = Map.of(
                "name",
                "Name is required"
        );

        ErrorResponseDTO dto = new ErrorResponseDTO(
                timestamp,
                400,
                "Bad Request",
                "Validation failed",
                "/api/v1/categories",
                details
        );

        assertEquals(timestamp, dto.timestamp());
        assertEquals(400, dto.status());
        assertEquals("Bad Request", dto.error());
        assertEquals("Validation failed", dto.message());
        assertEquals("/api/v1/categories", dto.path());
        assertEquals(details, dto.details());
    }

    @Test
    @DisplayName("Should create error response dto without details")
    void shouldCreateErrorResponseDTOWithoutDetails() {

        LocalDateTime timestamp = LocalDateTime.now();

        ErrorResponseDTO dto = new ErrorResponseDTO(
                timestamp,
                404,
                "Not Found",
                "Category not found",
                "/api/v1/categories/1",
                null
        );

        assertEquals(timestamp, dto.timestamp());
        assertEquals(404, dto.status());
        assertEquals("Not Found", dto.error());
        assertEquals("Category not found", dto.message());
        assertEquals("/api/v1/categories/1", dto.path());
        assertNull(dto.details());
    }
}