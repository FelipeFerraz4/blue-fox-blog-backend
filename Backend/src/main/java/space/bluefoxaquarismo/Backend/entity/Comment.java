package space.bluefoxaquarismo.Backend.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "blog")
@EqualsAndHashCode(of = "id")
@FilterDef(name = "blogFilter", parameters = @ParamDef(name = "blogId", type = UUID.class))
@Filter(name = "blogFilter", condition = "blog_id = :blogId")
@Schema(name = "Comment", description = "Represents a comment on a blog post or article.")
public class Comment {

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blog_id", nullable = false)
    @Schema(
            description = "The blog tenant this author belongs to",
            example = "3aa0b234-d19b-4cd3-b219-112233445566",
            accessMode = Schema.AccessMode.READ_ONLY
    )
    private Blog blog;

    @NotBlank(message = "Comment content cannot be empty")
    @Size(max = 300, message = "Comment content must be under 300 characters")
    @Column(columnDefinition = "TEXT", nullable = false)
    @Schema(
            description = "Content of the comment",
            example = "This is a great post! I learned a lot from it."
    )
    private String content;

    @NotBlank(message = "Author name cannot be empty")
    @Column(nullable = false)
    @Schema(
            description = "Author name of the comment",
            example = "Leila Cunha Cardoso"
    )
    private String authorName;

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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "post_id", nullable = false)
    @Schema(description = "The post this comment belongs to", accessMode = Schema.AccessMode.READ_ONLY)
    private Post post;
}