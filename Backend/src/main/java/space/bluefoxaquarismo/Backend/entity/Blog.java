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
@Table(name = "blogs")
@Schema(name = "Blog", description = "Represents a single blog tenant instance.")
public class Blog {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(nullable = false, unique = true, updatable = false)
    @Schema(
            description = "Unique identifier of the blog",
            example = "3aa0b234-d19b-4cd3-b219-112233445566",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private UUID id;

    @Column(nullable = false)
    @Schema(
            description = "Full name of the blog", example = "Blue Fox Aquarismo")
    private String name;

    @Column(nullable = false, unique = true)
    @Schema(
            description = "Unique slug for the blog URL, SEO-friendly slug",
            example = "leila-cunha-cardoso"
    )
    private String slug;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Schema(
            description = "Current blog status",
            example = "ACTIVE"
    )
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "created_at")
    @CreationTimestamp
    @Schema(
            description = "Date and time the blog was created",
            example = "2026-05-29T18:00:00Z",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private OffsetDateTime createdAt;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "updated_at")
    @UpdateTimestamp
    @Schema(
            description = "Date and time the blog profile was last updated",
            example = "2026-06-12T17:15:00Z",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private OffsetDateTime updatedAt;
}