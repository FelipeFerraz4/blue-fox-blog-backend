package space.bluefoxaquarismo.Backend.dto.post;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.util.UUID;

@Schema(description = "Request payload for post creation or update")
public record RequestPostDTO(

        @Schema(
                description = "Title of the blog post",
                example = "Como montar seu primeiro aquário plantado"
        )
        @NotBlank(message = "Post title cannot be null or empty")
        @Size(min = 5, max = 255, message = "Post title must be between 5 and 255 characters")
        String title,

        @Schema(
                description = "Short description or summary of the post for SEO and cards",
                example = "Um guia passo a passo completo para iniciantes no aquarismo plantado..."
        )
        @NotBlank(message = "Post description cannot be null or empty")
        @Size(max = 160, message = "Post description cannot exceed 160 characters")
        String description,

        @Schema(
                description = "URL of the post's cover image",
                example = "https://example.com/images/aquario-plantado.jpg"
        )
        @Size(max = 255, message = "Image URL cannot exceed 255 characters")
        String imageUrl,

        @Schema(
                description = "Unique, SEO-friendly slug for the post URL",
                example = "como-montar-seu-primeiro-aquario-plantado"
        )
        @NotBlank(message = "Post slug cannot be null or empty")
        @Size(min = 3, max = 255, message = "Post slug must be between 3 and 255 characters")
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Post slug must contain only lowercase letters, numbers and single hyphens between words"
        )
        String slug,

        @Schema(
                description = "Estimated reading time (e.g., '5 min')",
                example = "5 min"
        )
        @Size(max = 50, message = "Reading time cannot exceed 50 characters")
        String readingTime,

        @Schema(
                description = "Publishing status of the post",
                example = "false"
        )
        boolean published,

        @Schema(
                description = "The unique identifier of the category this post belongs to",
                example = "a1b2c3d4-e5f6-7a8b-9c0d-112233445566"
        )
        @NotNull(message = "Category ID cannot be null")
        UUID categoryId,

        @Schema(
                description = "The unique identifier of the author who wrote the post",
                example = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
        )
        @NotNull(message = "Author ID cannot be null")
        UUID authorId

) {}