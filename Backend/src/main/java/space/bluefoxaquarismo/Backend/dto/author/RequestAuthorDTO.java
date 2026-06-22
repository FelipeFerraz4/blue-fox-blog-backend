package space.bluefoxaquarismo.Backend.dto.author;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

@Schema(description = "Request payload for author creation or update")
public record RequestAuthorDTO(

        @Schema(
                description = "Full name of the author",
                example = "Leila Cunha Cardoso"
        )
        @NotBlank(message = "Author name cannot be null or empty")
        @Size(min = 3, max = 255, message = "Author name must be between 3 and 255 characters")
        String name,

        @Schema(
                description = "Short biography or professional background of the author",
                example = "Aquarist with over a decade of experience, specialized in freshwater aquascaping and fish breeding."
        )
        @NotBlank(message = "Author biography cannot be null or empty")
        String bio,

        @Schema(
                description = "URL of the author's profile picture",
                example = "https://example.com/profile.jpg"
        )
        @NotBlank(message = "Profile picture URL cannot be null or empty")
        String profilePictureUrl,

        @Schema(
                description = "Unique slug for the author URL, SEO-friendly slug",
                example = "leila-cunha-cardoso"
        )
        @NotBlank(message = "Author slug cannot be null or empty")
        @Size(min = 3, max = 255, message = "Author slug must be between 3 and 255 characters")
        @Pattern(
                regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
                message = "Author slug must contain only lowercase letters, numbers and single hyphens between words"
        )
        String slug,

        @Schema(
                description = "User's email for contact",
                example = "leilacunha@gmail.com"
        )
        @NotBlank(message = "Email cannot be null or empty")
        @Email(message = "Email must be a valid email address")
        @Size(max = 255, message = "Email cannot exceed 255 characters")
        String email

) {}