package space.bluefoxaquarismo.Backend.dto.author;

import io.swagger.v3.oas.annotations.media.Schema;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.time.OffsetDateTime;
import java.util.UUID;

@Schema(description = "Response payload representing an author")
public record ResultAuthorDTO(

        @Schema(
                description = "Unique identifier of the author",
                example = "3aa0b234-d19b-4cd3-b219-112233445566",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,

        @Schema(
                description = "Full name of the author",
                example = "Leila Cunha Cardoso"
        )
        String name,

        @Schema(
                description = "Short biography or professional background of the author",
                example = "Aquarist with over a decade of experience, specialized in freshwater aquascaping and fish breeding."
        )
        String bio,

        @Schema(
                description = "URL of the author's profile picture",
                example = "https://example.com/profile.jpg"
        )
        String profilePictureUrl,

        @Schema(
                description = "Unique slug for the author URL, SEO-friendly slug",
                example = "leila-cunha-cardoso"
        )
        String slug,

        @Schema(
                description = "User's email for contact",
                example = "leilacunha@gmail.com"
        )
        String email,

        @Schema(
                description = "Current author status",
                example = "ACTIVE"
        )
        Status status,

        @Schema(
                description = "Date and time the author was created",
                example = "2026-05-29T18:00:00Z",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        OffsetDateTime createdAt,

        @Schema(
                description = "Date and time the author profile was last updated",
                example = "2026-06-12T17:15:00Z",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        OffsetDateTime updatedAt

) {}