package space.bluefoxaquarismo.Backend.entity;

import lombok.Getter;

@Getter
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
