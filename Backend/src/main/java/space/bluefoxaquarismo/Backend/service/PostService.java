package space.bluefoxaquarismo.Backend.service;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.bluefoxaquarismo.Backend.dto.post.RequestPostDTO;
import space.bluefoxaquarismo.Backend.dto.post.ResultPostDTO;
import space.bluefoxaquarismo.Backend.entity.Author;
import space.bluefoxaquarismo.Backend.entity.Category;
import space.bluefoxaquarismo.Backend.entity.Post;
import space.bluefoxaquarismo.Backend.entity.Status;
import space.bluefoxaquarismo.Backend.exception.author.AuthorNotFoundException;
import space.bluefoxaquarismo.Backend.exception.category.CategoryNotFoundException;
import space.bluefoxaquarismo.Backend.exception.post.PostAlreadyExistsException;
import space.bluefoxaquarismo.Backend.exception.post.PostNotFoundException;
import space.bluefoxaquarismo.Backend.mapper.PostMapper;
import space.bluefoxaquarismo.Backend.repository.AuthorRepository;
import space.bluefoxaquarismo.Backend.repository.CategoryRepository;
import space.bluefoxaquarismo.Backend.repository.PostRepository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final CategoryRepository categoryRepository;
    private final AuthorRepository authorRepository;

    /**
     * Creates a new post.
     *
     * @param postDTO The post data transfer object.
     * @return The created post, ResultPostDTO.
     */
    @Transactional
    public ResultPostDTO create(RequestPostDTO postDTO) {
        validateSlug(postDTO.slug());

        Category category = categoryRepository.findById(postDTO.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(postDTO.categoryId()));

        Author author = authorRepository.findById(postDTO.authorId())
                .orElseThrow(() -> new AuthorNotFoundException(postDTO.authorId()));

        Post post = postMapper.toEntity(postDTO);
        post.setCategory(category);
        post.setAuthor(author);

        if (post.isPublished() && post.getPublishedAt() == null) {
            post.setPublishedAt(OffsetDateTime.now());
        }

        return saveAndMap(post);
    }

    /**
     * Find a post by id.
     *
     * @param id Post id
     * @return Found post, ResultPostDTO
     */
    public ResultPostDTO findById(UUID id) {
        Post post = findPostEntityById(id);
        return postMapper.toResponseDTO(post);
    }

    /**
     * Find a post by slug.
     *
     * @param slug Post slug
     * @return Found post, ResultPostDTO
     */
    public ResultPostDTO findBySlug(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new PostNotFoundException("slug", slug));
        return postMapper.toResponseDTO(post);
    }

    /**
     * Find all posts.
     *
     * @return List of posts
     */
    public List<ResultPostDTO> findAll() {
        List<Post> posts = postRepository.findAll();
        return posts.stream().map(postMapper::toResponseDTO).toList();
    }

    /**
     * Find all active posts.
     *
     * @return List of active posts
     */
    public List<ResultPostDTO> findAllActive() {
        List<Post> posts = postRepository.findAllByStatus(Status.ACTIVE);
        return posts.stream().map(postMapper::toResponseDTO).toList();
    }

    /**
     * Find all posts by status.
     *
     * @param status Post status
     * @return List of posts
     */
    public List<ResultPostDTO> findAllByStatus(Status status) {
        List<Post> posts = postRepository.findAllByStatus(status);
        return posts.stream().map(postMapper::toResponseDTO).toList();
    }

    /**
     * Update an existing post.
     *
     * @param id      Post id
     * @param postDTO Post data transfer object
     * @return Updated post, ResultPostDTO
     */
    @Transactional
    public ResultPostDTO update(UUID id, RequestPostDTO postDTO) {
        Post post = findPostEntityById(id);

        if (!post.getSlug().equals(postDTO.slug())) {
            validateSlug(postDTO.slug());
        }

        Category category = categoryRepository.findById(postDTO.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(postDTO.categoryId()));

        Author author = authorRepository.findById(postDTO.authorId())
                .orElseThrow(() -> new AuthorNotFoundException(postDTO.authorId()));

        post.setTitle(postDTO.title());
        post.setDescription(postDTO.description());
        post.setImageUrl(postDTO.imageUrl());
        post.setSlug(postDTO.slug());
        post.setReadingTime(postDTO.readingTime());
        post.setCategory(category);
        post.setAuthor(author);

        if (postDTO.published() && !post.isPublished()) {
            post.setPublishedAt(OffsetDateTime.now());
        } else if (!postDTO.published()) {
            post.setPublishedAt(null);
        }
        post.setPublished(postDTO.published());

        return saveAndMap(post);
    }

    /**
     * Increment the view counter of a post.
     *
     * @param id Post id
     */
    @Transactional
    public void incrementViews(UUID id) {
        Post post = findPostEntityById(id);
        post.setViews(post.getViews() + 1);
        postRepository.save(post);
    }

    /**
     * SoftDelete an existing post.
     *
     * @param id Post id
     */
    @Transactional
    public void softDelete(UUID id) {
        Post post = findPostEntityById(id);
        post.setStatus(Status.DELETED);
        postRepository.save(post);
    }

    /**
     * HardDelete an existing post.
     *
     * @param id Post id
     */
    @Transactional
    public void hardDelete(UUID id) {
        Post post = findPostEntityById(id);
        postRepository.delete(post);
    }

    /**
     * Update post status.
     *
     * @param id     Post id
     * @param status Post status
     * @return Updated post, ResultPostDTO
     */
    @Transactional
    public ResultPostDTO updateStatus(UUID id, Status status) {
        Post post = findPostEntityById(id);
        post.setStatus(status);
        return saveAndMap(post);
    }

    /**
     * Validate duplicated post slug.
     *
     * @param slug Post slug
     */
    private void validateSlug(String slug) {
        if (postRepository.existsBySlug(slug)) {
            throw new PostAlreadyExistsException("slug", slug);
        }
    }

    /**
     * Find post-entity by id.
     *
     * @param id Post id
     * @return Post entity
     */
    private Post findPostEntityById(UUID id) {
        return postRepository.findById(id)
                .orElseThrow(() -> new PostNotFoundException(id));
    }

    /**
     * Save and map post-entity.
     *
     * @param post Post entity
     * @return ResultPostDTO
     */
    private ResultPostDTO saveAndMap(Post post) {
        return postMapper.toResponseDTO(
                postRepository.save(post)
        );
    }
}