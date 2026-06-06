package space.bluefoxaquarismo.Backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.bluefoxaquarismo.Backend.dto.category.RequestCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.ResultCategoryDTO;
import space.bluefoxaquarismo.Backend.entity.Category;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.exception.CategoryAlreadyExistsException;
import space.bluefoxaquarismo.Backend.exception.CategoryNotFoundException;
import space.bluefoxaquarismo.Backend.mapper.CategoryMapper;
import space.bluefoxaquarismo.Backend.repository.CategoryRepository;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;

    /**
     * Creates a new category.
     *
     * @param categoryDTO The category data transfer object.
     * @return The created category, ResultCategoryDTO.
     */
    @Transactional
    public ResultCategoryDTO create(RequestCategoryDTO categoryDTO) {
        validateName(categoryDTO.name());
        validateSlug(categoryDTO.slug());

        Category category = categoryMapper.toEntity(categoryDTO);

        return saveAndMap(category);
    }

    /**
     * Find a category by id.
     *
     * @param id Category id
     * @return Found category, ResultCategoryDTO
     */
    public ResultCategoryDTO findById(UUID id){
        Category category = findCategoryEntityById(id);

        return categoryMapper.toResponseDTO(category);
    }

    /**
     * Find a category by name.
     *
     * @param name Category name
     * @return Found category, ResultCategoryDTO
     */
    public ResultCategoryDTO findByName(String name){
        Category category = categoryRepository.findByName(name).orElseThrow(() -> new CategoryNotFoundException("Category not found with name: " + name));

        return categoryMapper.toResponseDTO(category);
    }

    /**
     * Find a category by slug.
     *
     * @param slug Category slug
     * @return Found category, ResultCategoryDTO
     */
    public ResultCategoryDTO findBySlug(String slug){
        Category category = categoryRepository.findBySlug(slug).orElseThrow(() -> new CategoryNotFoundException("Category not found with slug: " + slug));

        return categoryMapper.toResponseDTO(category);
    }

    /**
     * Find all categories.
     *
     * @return List of categories
     */
    public List<ResultCategoryDTO> findAll(){
        List<Category> categories = categoryRepository.findAll();
        return categories.stream().map(categoryMapper::toResponseDTO).toList();
    }

    /**
     * Find all active categories.
     *
     * @return List of active categories
     */
    public List<ResultCategoryDTO> findAllActive(){
        List<Category> categories = categoryRepository.findAllByStatus(Status.ACTIVE);
        return categories.stream().map(categoryMapper::toResponseDTO).toList();
    }

    /**
     * Find all categories by status.
     * @param status Category status
     * @return List of categories
     */
    public List<ResultCategoryDTO> findAllByStatus(Status status){
        List<Category> categories = categoryRepository.findAllByStatus(status);
        return categories.stream().map(categoryMapper::toResponseDTO).toList();
    }

    /**
     * Update an existing category.
     *
     * @param id, category id
     * @param categoryDTO category data transfer object
     * @return updated category, ResultCategoryDTO
     */
    @Transactional
    public ResultCategoryDTO update(UUID id, RequestCategoryDTO categoryDTO){
        Category category = findCategoryEntityById(id);

        if (!category.getName().equals(categoryDTO.name())) {
            validateName(categoryDTO.name());
        }

        if (!category.getSlug().equals(categoryDTO.slug())) {
            validateSlug(categoryDTO.slug());
        }

        category.setName(categoryDTO.name());
        category.setDescription(categoryDTO.description());
        category.setSlug(categoryDTO.slug());

        return saveAndMap(category);
    }

    /**
     * SoftDelete an existing category.
     *
     * @param id, category id
     */
    @Transactional
    public void softDelete(UUID id){
        Category category = findCategoryEntityById(id);

        category.setStatus(Status.DELETED);

        categoryRepository.save(category);
    }

    /**
     * HardDelete an existing category.
     *
     * @param id, category id
     */
    @Transactional
    public void hardDelete(UUID id){
        Category category = findCategoryEntityById(id);
        categoryRepository.delete(category);
    }

    /**
     * Update category status.
     *
     * @param id, category id
     * @param status, Category status
     * @return updated category, ResultCategoryDTO
     */
    @Transactional
    public ResultCategoryDTO updateStatus(UUID id, Status status){
        Category category = findCategoryEntityById(id);

        category.setStatus(status);

        return saveAndMap(category);
    }

    /**
     * Validate duplicated category name.
     *
     * @param name Category name
     */
    private void validateName(String name) {
        if (categoryRepository.existsByName(name)) {
            throw new CategoryAlreadyExistsException("name", name);
        }
    }

    /**
     * Validate duplicated category slug.
     *
     * @param slug Category slug
     */
    private void validateSlug(String slug) {
        if (categoryRepository.existsBySlug(slug)) {
            throw new CategoryAlreadyExistsException("slug", slug);
        }
    }

    /**
     * Find category entity by id.
     *
     * @param id, category id
     * @return Category entity
     */
    private Category findCategoryEntityById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() ->
                        new CategoryNotFoundException(id));
    }

    /**
     * Save and map category entity.
     *
     * @param category, category entity
     * @return ResultCategoryDTO
     */
    private ResultCategoryDTO saveAndMap(Category category) {
        return categoryMapper.toResponseDTO(
                categoryRepository.save(category)
        );
    }
}
