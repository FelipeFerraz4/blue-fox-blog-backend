package space.bluefoxaquarismo.Backend.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import space.bluefoxaquarismo.Backend.documentation.DefaultApiResponses;
import space.bluefoxaquarismo.Backend.documentation.DefaultReadApiResponses;
import space.bluefoxaquarismo.Backend.dto.author.RequestAuthorDTO;
import space.bluefoxaquarismo.Backend.dto.author.ResultAuthorDTO;
import space.bluefoxaquarismo.Backend.dto.UpdateStatusDTO;
import space.bluefoxaquarismo.Backend.dto.error.ErrorResponseDTO;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.service.AuthorService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/authors")
@RequiredArgsConstructor
@Tag(name = "Author", description = "Operations related to author management")
public class AuthorController {

    private final AuthorService authorService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Create a new author",
            description = "Create a new author with the provided data"
    )
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Author created successfully"),
            @ApiResponse(responseCode = "409", description = "Author already exists", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultAuthorDTO create(@Valid @RequestBody RequestAuthorDTO authorDTO) {
        return authorService.create(authorDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find author by id", description = "Find an author by its id")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Author found"),
            @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultAuthorDTO findById(
            @PathVariable @Parameter(description = "Author id") UUID id) {
        return authorService.findById(id);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Find author by name", description = "Find an author by its name")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Author found"),
            @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultAuthorDTO findByName(
            @PathVariable @Parameter(description = "Author name") String name) {
        return authorService.findByName(name);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Find author by slug", description = "Find an author by its slug")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Author found"),
            @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultAuthorDTO findBySlug(
            @PathVariable @Parameter(description = "Author slug") String slug) {
        return authorService.findBySlug(slug);
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "Find author by email", description = "Find an author by its email")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Author found"),
            @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultAuthorDTO findByEmail(
            @PathVariable @Parameter(description = "Author email") String email) {
        return authorService.findByEmail(email);
    }

    @GetMapping
    @Operation(summary = "Find all active authors", description = "Find all active authors")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authors found")
    })
    public List<ResultAuthorDTO> findAllActive() {
        return authorService.findAllActive();
    }

    @GetMapping("/all")
    @Operation(summary = "Find all authors", description = "Find all authors")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authors found")
    })
    public List<ResultAuthorDTO> findAll() {
        return authorService.findAll();
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Find authors by status", description = "Find authors by their status")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Authors found")
    })
    public List<ResultAuthorDTO> findByStatus(@PathVariable @Parameter(description = "Author status") Status status) {
        return authorService.findAllByStatus(status);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing author", description = "Update an existing author with the provided data")
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Author updated successfully"),
            @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            )),
            @ApiResponse(responseCode = "409", description = "Author already exists", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultAuthorDTO update(
            @PathVariable @Parameter(description = "Author id") UUID id,
            @Valid @RequestBody RequestAuthorDTO authorDTO
    ){
        return authorService.update(id, authorDTO);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update author status", description = "Update the status of an author")
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Author status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultAuthorDTO updateStatus(
            @PathVariable @Parameter(description = "Author id") UUID id,
            @Valid @RequestBody UpdateStatusDTO dto
    ){
        return authorService.updateStatus(id, dto.status());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete author", description = "Soft delete an author")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Author soft deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public void softDelete(
            @PathVariable @Parameter(description = "Author id") UUID id
    ) {
        authorService.softDelete(id);
    }

    @DeleteMapping("/hard/{id}")
    @Operation(summary = "Hard delete author", description = "Hard delete an author")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Author hard deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public void hardDelete(
            @PathVariable @Parameter(description = "Author id") UUID id
    ) {
        authorService.hardDelete(id);
    }
}