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
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "categories")

@Schema(
        name = "Category",
        description = "Represents a category used to organize aquarium-related posts and content."
)
public class Category {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(nullable = false, unique = true, updatable = false)
    @Schema(
            description = "Unique identifier of the category",
            example = "550e8400-e29b-41d4-a716-446655440000",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private UUID id;

    @Column(nullable = false)
    @Schema( description = "Category name", example = "Fish Care" )
    private String name;

    @Column(nullable = false)
    @Schema(
            description = "Detailed description of the category",
            example = "Content related to fish health, feeding and maintenance."
    )
    private String description;

    @Column(nullable = false, unique = true)
    @Schema( description = "Unique slug for the category URL, SEO-friendly slug", example = "fish-care" )
    private String slug;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Schema( description = "Current category status", example = "ACTIVE" )
    private Status status;

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "created_at")
    @CreationTimestamp
    @Schema(
            description = "Date and time the category was created",
            example = "2026-05-29T18:00:00Z",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "updated_at")
    @UpdateTimestamp
    @Schema(
            description = "Date and time the category was last updated",
            example = "2026-05-29T18:10:00Z",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
