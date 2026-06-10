package space.bluefoxaquarismo.Backend.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Request payload for category creation or update")
public record RequestCategoryDTO(

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
                description = "Unique slug used in URLs",
                example = "freshwater-fish"
        )
        @NotBlank(message = "Category slug cannot be null or empty")
        @Size(min = 3, max = 255, message = "Category slug must be between 3 and 255 characters")
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Category slug must contain only lowercase letters, numbers and single hyphens between words"
        )
        String slug

) {}