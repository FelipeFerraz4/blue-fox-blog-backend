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
import space.bluefoxaquarismo.Backend.dto.post.RequestPostDTO;
import space.bluefoxaquarismo.Backend.dto.post.ResultPostDTO;
import space.bluefoxaquarismo.Backend.dto.UpdateStatusDTO;
import space.bluefoxaquarismo.Backend.dto.error.ErrorResponseDTO;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.service.PostService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/posts")
@RequiredArgsConstructor
@Tag(name = "Post", description = "Operations related to post management")
public class PostController {

    private final PostService postService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Create a new post",
            description = "Create a new post with the provided data"
    )
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Post created successfully"),
            @ApiResponse(responseCode = "404", description = "Category or Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            )),
            @ApiResponse(responseCode = "409", description = "Post slug already exists", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultPostDTO create(@Valid @RequestBody RequestPostDTO postDTO) {
        return postService.create(postDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find post by id", description = "Find a post by its id")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Post found"),
            @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultPostDTO findById(
            @PathVariable @Parameter(description = "Post id") UUID id) {
        return postService.findById(id);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Find post by slug", description = "Find a post by its slug")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Post found"),
            @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultPostDTO findBySlug(
            @PathVariable @Parameter(description = "Post slug") String slug) {
        return postService.findBySlug(slug);
    }

    @GetMapping
    @Operation(summary = "Find all active posts", description = "Find all active posts")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Posts found")
    })
    public List<ResultPostDTO> findAllActive() {
        return postService.findAllActive();
    }

    @GetMapping("/all")
    @Operation(summary = "Find all posts", description = "Find all posts")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Posts found")
    })
    public List<ResultPostDTO> findAll() {
        return postService.findAll();
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Find posts by status", description = "Find posts by their status")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Posts found")
    })
    public List<ResultPostDTO> findByStatus(@PathVariable @Parameter(description = "Post status") Status status) {
        return postService.findAllByStatus(status);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing post", description = "Update an existing post with the provided data")
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Post updated successfully"),
            @ApiResponse(responseCode = "404", description = "Post, Category or Author not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            )),
            @ApiResponse(responseCode = "409", description = "Post slug already exists", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultPostDTO update(
            @PathVariable @Parameter(description = "Post id") UUID id,
            @Valid @RequestBody RequestPostDTO postDTO
    ){
        return postService.update(id, postDTO);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update post status", description = "Update the status of a post")
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Post status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultPostDTO updateStatus(
            @PathVariable @Parameter(description = "Post id") UUID id,
            @Valid @RequestBody UpdateStatusDTO dto
    ){
        return postService.updateStatus(id, dto.status());
    }

    @PatchMapping("/{id}/views")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Increment post views", description = "Increment the view counter of a post by 1")
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Post view incremented successfully"),
            @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public void incrementViews(@PathVariable @Parameter(description = "Post id") UUID id) {
        postService.incrementViews(id);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete post", description = "Soft delete a post")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Post soft deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public void softDelete(
            @PathVariable @Parameter(description = "Post id") UUID id
    ) {
        postService.softDelete(id);
    }

    @DeleteMapping("/hard/{id}")
    @Operation(summary = "Hard delete post", description = "Hard delete a post")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Post hard deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Post not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public void hardDelete(
            @PathVariable @Parameter(description = "Post id") UUID id
    ) {
        postService.hardDelete(id);
    }
}