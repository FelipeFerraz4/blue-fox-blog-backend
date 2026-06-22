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
import space.bluefoxaquarismo.Backend.dto.category.RequestCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.ResultCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.UpdateStatusDTO;
import space.bluefoxaquarismo.Backend.dto.error.ErrorResponseDTO;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.service.CategoryService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@Tag(name = "Category", description = "Operations related to category management")
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Create a new category",
            description = "Create a new category with the provided data"
    )
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Category created successfully"),
            @ApiResponse(responseCode = "409", description = "Category already exists", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))

    })
    public ResultCategoryDTO create(@Valid @RequestBody RequestCategoryDTO categoryDTO) {
        return categoryService.create(categoryDTO);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Find category by id", description = "Find a category by its id")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category found"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultCategoryDTO findById(
            @PathVariable @Parameter(description = "Category id") UUID id) {
        return categoryService.findById(id);
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "Find category by name", description = "Find a category by its name")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category found"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultCategoryDTO findByName(
            @PathVariable @Parameter(description = "Category name") String name) {
        return categoryService.findByName(name);
    }

    @GetMapping("/slug/{slug}")
    @Operation(summary = "Find category by slug", description = "Find a category by its slug")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category found"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultCategoryDTO findBySlug(
            @PathVariable @Parameter(description = "Category slug") String slug) {
        return categoryService.findBySlug(slug);
    }

    @GetMapping
    @Operation(summary = "Find all active categories", description = "Find all active categories")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categories found")
    })
    public List<ResultCategoryDTO> findAllActive() {
        return categoryService.findAllActive();
    }

    @GetMapping("/all")
    @Operation(summary = "Find all categories", description = "Find all categories")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categories found")
    })
    public List<ResultCategoryDTO> findAll() {
        return categoryService.findAll();
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Find categories by status", description = "Find categories by their status")
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Categories found")
    })
    public List<ResultCategoryDTO> findByStatus(@PathVariable @Parameter(description = "Category status") Status status) {
        return categoryService.findAllByStatus(status);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing category", description = "Update an existing category with the provided data")
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category updated successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
            ,@ApiResponse(responseCode = "409", description = "Category already exists", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultCategoryDTO update(
            @PathVariable @Parameter(description = "Category id") UUID id,
            @Valid @RequestBody RequestCategoryDTO categoryDTO
    ){
        return categoryService.update(id, categoryDTO);
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update category status", description = "Update the status of a category")
    @DefaultApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Category status updated successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public ResultCategoryDTO updateStatus(
            @PathVariable @Parameter(description = "Category id") UUID id,
            @Valid @RequestBody UpdateStatusDTO dto
    ){
        return categoryService.updateStatus(id, dto.status());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft delete category", description = "Soft delete a category")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Category soft deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public void softDelete(
            @PathVariable @Parameter(description = "Category id") UUID id
    ) {
        categoryService.softDelete(id);
    }

    @DeleteMapping("/hard/{id}")
    @Operation(summary = "Hard delete category", description = "Hard delete a category")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @DefaultReadApiResponses
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Category hard deleted successfully"),
            @ApiResponse(responseCode = "404", description = "Category not found", content = @Content(
                    schema = @Schema(implementation = ErrorResponseDTO.class)
            ))
    })
    public void hardDelete(
            @PathVariable @Parameter(description = "Category id") UUID id
    ) {
        categoryService.hardDelete(id);
    }
}
