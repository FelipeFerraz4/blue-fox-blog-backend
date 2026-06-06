package space.bluefoxaquarismo.Backend.dto.category;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record ResultCategoryDTO(

        @NotNull(message = "Category id cannot be null")
        UUID id,

        @NotBlank(message = "Category name cannot be null or empty")
        @Size(min = 3, max = 255, message = "Category name must be between 3 and 255 characters")
        String name,

        @NotBlank(message = "Category description cannot be null or empty")
        String description,

        @NotBlank(message = "Category slug cannot be null or empty")
        @Size(min = 3, max = 255, message = "Category slug must be between 3 and 255 characters")
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Category slug must contain only lowercase letters, numbers and single hyphens between words"
        )
        String slug
) {}
