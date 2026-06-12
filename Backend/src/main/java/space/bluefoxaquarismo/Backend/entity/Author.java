package space.bluefoxaquarismo.Backend.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.annotations.UuidGenerator;

import java.time.OffsetDateTime;
import java.util.UUID;

@Getter
@Setter
@ToString
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "authors")
@Schema(name = "Author", description = "Represents an author of a blog post or article.")
public class Author {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(nullable = false, unique = true, updatable = false)
    @Schema(
            description = "Unique identifier of the author",
            example = "3aa0b234-d19b-4cd3-b219-112233445566",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private UUID id;

    @Column(nullable = false)
    @Schema(
            description = "Full name of the author", example = "Leila Cunha Cardoso")
    private String name;

    @Column(columnDefinition = "TEXT")
    @Schema(
            description = "Short biography or professional background of the author",
            example = "Aquarist with over a decade of experience, specialized in freshwater aquascaping and fish breeding."
    )
    private String bio;

    @Column(name = "profile_picture_url")
    @Schema(
            description = "URL of the author's profile picture",
            example = "https://example.com/profile.jpg"
    )
    private String profilePictureUrl;

    @Column(nullable = false, unique = true)
    @Schema(
            description = "Unique slug for the author URL, SEO-friendly slug",
            example = "leila-cunha-cardoso"
    )
    private String slug;

    @Column(nullable = false, unique = true)
    @Schema(
            description = "user's email for contact",
            example = "leilacunha@gmail.com"
    )
    private String email;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Schema(
            description = "Current author status",
            example = "ACTIVE"
    )
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "created_at")
    @CreationTimestamp
    @Schema(
            description = "Date and time the author was created",
            example = "2026-05-29T18:00:00Z",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private OffsetDateTime createdAt;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "updated_at")
    @UpdateTimestamp
    @Schema(
            description = "Date and time the author profile was last updated",
            example = "2026-06-12T17:15:00Z",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private OffsetDateTime updatedAt;
}
