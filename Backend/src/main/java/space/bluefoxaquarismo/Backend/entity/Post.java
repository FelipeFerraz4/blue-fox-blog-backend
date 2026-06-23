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
@ToString(exclude = {"author", "category"})
@EqualsAndHashCode(of = "id")
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "posts")
@Schema(name = "Post", description = "Represents a blog post or article in the system.")
public class Post {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(nullable = false, unique = true, updatable = false)
    @Schema(
            description = "Unique identifier of the post",
            example = "a1b2c3d4-e5f6-7a8b-9c0d-112233445566",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private UUID id;

    @Column(nullable = false)
    @Schema(
            description = "Title of the blog post",
            example = "Como montar seu primeiro aquário plantado"
    )
    private String title;

    @Column(nullable = false, length = 160)
    @Schema(
            description = "Short description or summary of the post for SEO and cards",
            example = "Um guia passo a passo completo para iniciantes no aquarismo plantado..."
    )
    private String description;

    @Column(name = "image_url")
    @Schema(
            description = "URL of the post's cover image",
            example = "https://example.com/images/aquario-plantado.jpg"
    )
    private String imageUrl;

    @Column(nullable = false, unique = true)
    @Schema(
            description = "Unique, SEO-friendly slug for the post URL",
            example = "como-montar-seu-primeiro-aquario-plantado"
    )
    private String slug;

    @Column(name = "reading_time")
    @Schema(
            description = "Estimated reading time (e.g., '5 min')",
            example = "5 min"
    )
    private String readingTime;

    @Column(nullable = false)
    @Schema(
            description = "Publishing status of the post",
            example = "false"
    )
    @Builder.Default
    private boolean published = false;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    @Schema( description = "Current category status", example = "ACTIVE" )
    @Builder.Default
    private Status status = Status.ACTIVE;

    @Column(name = "published_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    @Schema(
            description = "The exact date and time the post was made public",
            example = "2026-06-23T10:00:00Z"
    )
    private OffsetDateTime publishedAt;

    @Column(nullable = false)
    @Schema(
            description = "Total number of views this post has received",
            example = "1250"
    )
    @Builder.Default
    private Long views = 0L;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id", nullable = false)
    @Schema(description = "The author who wrote the post")
    private Author author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    @Schema(description = "The category this post belongs to")
    private Category category;

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "created_at")
    @CreationTimestamp
    @Schema(
            description = "Date and time the post was created",
            example = "2026-06-23T01:15:00Z",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private OffsetDateTime createdAt;

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "updated_at")
    @UpdateTimestamp
    @Schema(
            description = "Date and time the post was last updated",
            example = "2026-06-23T01:30:00Z",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private OffsetDateTime updatedAt;
}