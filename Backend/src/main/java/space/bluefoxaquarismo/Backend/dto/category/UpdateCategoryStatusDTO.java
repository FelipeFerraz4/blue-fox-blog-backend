package space.bluefoxaquarismo.Backend.dto.category;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import space.bluefoxaquarismo.Backend.entity.Status;

@Schema(description = "Request payload to update a category status")
public record UpdateCategoryStatusDTO(

        @NotNull(message = "Status cannot be null")
        @Schema(
                description = "New category status",
                example = "ACTIVE",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        Status status

) {}