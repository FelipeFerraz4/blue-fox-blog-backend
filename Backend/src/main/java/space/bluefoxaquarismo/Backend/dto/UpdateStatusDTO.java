package space.bluefoxaquarismo.Backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import space.bluefoxaquarismo.Backend.entity.Status;

@Schema(description = "Request payload to update a entity status")
public record UpdateStatusDTO(

        @NotNull(message = "Status cannot be null")
        @Schema(
                description = "New entity status",
                example = "ACTIVE",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        Status status

) {}