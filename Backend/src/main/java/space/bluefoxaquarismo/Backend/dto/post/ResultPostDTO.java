package space.bluefoxaquarismo.Backend.dto.post;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Post response object")
public record ResultPostDTO(

        @Schema(
                description = "Unique post identifier",
                example = "a1b2c3d4-e5f6-7a8b-9c0d-112233445566"
        )
        @NotNull(message = "Post id cannot be null")
        UUID id,

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
                description = "Category name",
                example = "Freshwater Fish"
        )
        @NotNull(message = "Category name cannot be null")
        String categoryName,

        @Schema(
                description = "The unique identifier of the author who wrote the post",
                example = "f47ac10b-58cc-4372-a567-0e02b2c3d479"
        )
        @NotNull(message = "Author ID cannot be null")
        UUID authorId,

        @Schema(
                description = "Author name",
                example = "Leila Cunha Cardoso"
        )
        @NotNull(message = "Author name cannot be null")
        String authorName,

        @Schema(
                description = "Current post status",
                example = "ACTIVE"
        )
        Status status,

        @Schema(
                description = "The exact date and time the post was made public",
                example = "2026-06-23T10:00:00Z"
        )
        OffsetDateTime publishedAt,

        @Schema(
                description = "Total number of views this post has received",
                example = "1250"
        )
        @NotNull
        Long views,

        @Schema(
                description = "Date and time the post was created",
                example = "2026-06-23T01:15:00Z",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        OffsetDateTime createdAt,

        @Schema(
                description = "Date and time the post was last updated",
                example = "2026-06-23T01:30:00Z",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        OffsetDateTime updatedAt
) {}