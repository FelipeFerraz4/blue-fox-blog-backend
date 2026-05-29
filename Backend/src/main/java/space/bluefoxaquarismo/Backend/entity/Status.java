package space.bluefoxaquarismo.Backend.entity;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema( description = "Represents the current status of an entity." )
public enum Status {
    ACTIVE("Active"),
    INACTIVE("Inactive"),
    SUSPENDED("Suspended"),
    PENDING("Pending approval"),
    DELETED("Deleted");

    private final String description;

    Status(String description) {
        this.description = description;
    }
}
