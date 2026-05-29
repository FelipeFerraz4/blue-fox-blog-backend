package space.bluefoxaquarismo.Backend.entity;

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
public class Category {

    @Id
    @GeneratedValue
    @UuidGenerator
    @Column(nullable = false, unique = true, updatable = false)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false, unique = true)
    private String slug;

    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status;

    @Column(nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "created_at")
    @CreationTimestamp
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(nullable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE", name = "updated_at")
    @UpdateTimestamp
    private OffsetDateTime updatedAt = OffsetDateTime.now();
}
