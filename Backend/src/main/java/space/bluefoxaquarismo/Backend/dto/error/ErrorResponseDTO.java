package space.bluefoxaquarismo.Backend.dto.error;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.Map;

@Schema(description = "Standard API error response")
public record ErrorResponseDTO(

        @Schema(
                description = "Timestamp when the error occurred",
                example = "2026-07-10T18:22:00"
        )
        LocalDateTime timestamp,

        @Schema(
                description = "HTTP status code",
                example = "404"
        )
        Integer status,

        @Schema(
                description = "HTTP status reason",
                example = "Not Found"
        )
        String error,

        @Schema(
                description = "Detailed error message",
                example = "Category not found with id: 123e4567-e89b-12d3-a456-426614174000"
        )
        String message,

        @Schema(
                description = "Request path that generated the error",
                example = "/api/v1/categories/123e4567-e89b-12d3-a456-426614174000"
        )
        String path,

        @Schema(
                description = "Additional validation details when applicable",
                example = "{\"name\":\"Name cannot be blank\"}"
        )
        Map<String, String> details

) {}