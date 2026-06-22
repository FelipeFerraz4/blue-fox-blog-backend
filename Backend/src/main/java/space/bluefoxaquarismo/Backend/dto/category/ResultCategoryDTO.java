package space.bluefoxaquarismo.Backend.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Category response object")
public record ResultCategoryDTO(

        @Schema(
                description = "Unique category identifier",
                example = "550e8400-e29b-41d4-a716-446655440000"
        )
        @NotNull(message = "Category id cannot be null")
        UUID id,

        @Schema(
                description = "Category name",
                example = "Freshwater Fish"
        )
        @NotBlank(message = "Category name cannot be null or empty")
        @Size(min = 3, max = 255, message = "Category name must be between 3 and 255 characters")
        String name,

        @Schema(
                description = "Category description",
                example = "Category related to freshwater fish species"
        )
        @NotBlank(message = "Category description cannot be null or empty")
        String description,

        @Schema(
                description = "URL friendly category identifier",
                example = "freshwater-fish"
        )
        @NotBlank(message = "Category slug cannot be null or empty")
        @Size(min = 3, max = 255, message = "Category slug must be between 3 and 255 characters")
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Category slug must contain only lowercase letters, numbers and single hyphens between words"
        )
        String slug,


        @Schema(
                description = "Current category status",
                example = "ACTIVE"
        )
        Status status,

        @Schema(
                description = "Date and time the category was created",
                example = "2026-05-29T18:00:00Z",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        OffsetDateTime createdAt,

        @Schema(
                description = "Date and time the category profile was last updated",
                example = "2026-06-12T17:15:00Z",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        OffsetDateTime updatedAt

) {}