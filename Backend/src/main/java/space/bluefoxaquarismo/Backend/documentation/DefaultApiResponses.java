package space.bluefoxaquarismo.Backend.documentation;

import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import space.bluefoxaquarismo.Backend.dto.error.ErrorResponseDTO;

import java.lang.annotation.*;

@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
@ApiResponses({
        @ApiResponse(
                responseCode = "500",
                description = "Internal server error",
                content = @Content(
                        schema = @Schema(
                                implementation = ErrorResponseDTO.class
                        )
                )
        ),
        @ApiResponse(
                responseCode = "400",
                description = "Invalid request parameters or validation error",
                content = @Content(
                        schema = @Schema(
                                implementation = ErrorResponseDTO.class
                        )
                )
        )
})
public @interface DefaultApiResponses {
}