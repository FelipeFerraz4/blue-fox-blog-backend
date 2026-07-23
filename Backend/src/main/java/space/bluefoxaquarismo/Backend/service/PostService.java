package space.bluefoxaquarismo.Backend.service;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import space.bluefoxaquarismo.Backend.config.tenant.TenantContext;
import space.bluefoxaquarismo.Backend.dto.post.RequestPostDTO;
import space.bluefoxaquarismo.Backend.dto.post.ResultPostDTO;
import space.bluefoxaquarismo.Backend.entity.*;
import space.bluefoxaquarismo.Backend.exception.author.AuthorNotFoundException;
import space.bluefoxaquarismo.Backend.exception.category.CategoryNotFoundException;
import space.bluefoxaquarismo.Backend.exception.post.PostAlreadyExistsException;
import space.bluefoxaquarismo.Backend.exception.post.PostNotFoundException;
import space.bluefoxaquarismo.Backend.mapper.PostMapper;
import space.bluefoxaquarismo.Backend.repository.AuthorRepository;
import space.bluefoxaquarismo.Backend.repository.BlogRepository;
import space.bluefoxaquarismo.Backend.repository.CategoryRepository;
import space.bluefoxaquarismo.Backend.repository.PostRepository;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final PostMapper postMapper;
    private final CategoryRepository categoryRepository;
    private final BlogRepository blogRepository;
    private final AuthorRepository authorRepository;

    private static final double WEIGHT_VIEWS = 0.5;
    private static final double WEIGHT_LIKES = 2.0;
    private static final double WEIGHT_COMMENTS = 3.0;
    private static final double DECAY_DAYS_PENALTY = 0.1;

    /**
     * Finds the next sequence of posts based on a current post's slug,
     * excluding its manual recommended posts to prevent duplicate content on UI.
     *
     * @param slug Current post slug.
     * @param limit Maximum number of posts to return.
     * @return A {@link List} of next posts as {@link ResultPostDTO}.
     */
    @Transactional(readOnly = true)
    public List<ResultPostDTO> findNextPosts(String slug, int limit) {
        Post currentPost = postRepository.findBySlug(slug)
                .orElseThrow(() -> new PostNotFoundException("slug", slug));

        UUID currentPostId = currentPost.getId();
        UUID categoryId = currentPost.getCategory().getId();
        OffsetDateTime publishedAt = currentPost.getPublishedAt();

        Set<UUID> excludedRecommendedIds = currentPost.getRecommendedPostIds() != null
                ? currentPost.getRecommendedPostIds()
                : Set.of();

        Set<Post> nextPostsSet = new LinkedHashSet<>();

        List<Post> sameCategoryPosts = postRepository.findLatestPublishedByCategoryId(categoryId);
        sameCategoryPosts.stream()
                .filter(p -> !p.getId().equals(currentPostId))
                .filter(p -> !excludedRecommendedIds.contains(p.getId()))
                .limit(2)
                .forEach(nextPostsSet::add);

        if (publishedAt != null) {
            List<Post> olderPosts = postRepository.findPublishedBefore(publishedAt);
            olderPosts.stream()
                    .filter(p -> !p.getId().equals(currentPostId))
                    .filter(p -> !excludedRecommendedIds.contains(p.getId()))
                    .filter(p -> !nextPostsSet.contains(p))
                    .limit(2)
                    .forEach(nextPostsSet::add);
        }

        if (nextPostsSet.size() < limit) {
            List<Post> generalLatest = postRepository.findAllPublishedByStatusOrderByPublishedAtDesc(Status.ACTIVE);
            generalLatest.stream()
                    .filter(p -> !p.getId().equals(currentPostId))
                    .filter(p -> !excludedRecommendedIds.contains(p.getId()))
                    .filter(p -> !nextPostsSet.contains(p))
                    .limit((long) limit - nextPostsSet.size())
                    .forEach(nextPostsSet::add);
        }

        return nextPostsSet.stream()
                .map(postMapper::toResponseDTO)
                .toList();
    }

    /**
     * Retrieves the recommended posts for a given post-slug.
     * Uses the preloaded recommendedPostIds of the post-entity.
     *
     * @param slug The slug of the post.
     * @return A {@link List} of {@link ResultPostDTO} representing the recommended posts.
     */
    @Transactional(readOnly = true)
    public List<ResultPostDTO> findRecommendedPosts(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new PostNotFoundException("slug", slug));

        Set<UUID> recommendedIds = post.getRecommendedPostIds();
        if (recommendedIds == null || recommendedIds.isEmpty()) {
            return List.of();
        }

        return postRepository.findAllPublishedByIds(recommendedIds)
                .stream()
                .map(postMapper::toResponseDTO)
                .toList();
    }

    /**
     * Retrieves the latest published posts up to a given limit.
     *
     * @param limit The maximum number of posts to return.
     * @return A {@link List} of {@link ResultPostDTO} representing the latest posts.
     */
    @Transactional(readOnly = true)
    public List<ResultPostDTO> findLatestPosts(int limit) {
        List<Post> posts = postRepository.findAllPublishedByStatusOrderByPublishedAtDesc(Status.ACTIVE);

        return posts.stream()
                .limit(limit)
                .map(postMapper::toResponseDTO)
                .toList();
    }

    /**
     * Find the most relevant posts up to a given limit
     * @param limit Limit of posts to return
     * @return Post List limited by a variable, List<ResultPostDTO>
     */
    @Transactional(readOnly = true)
    @Cacheable(value = "mostRelevantPosts", key = "#limit")
    public List<ResultPostDTO> findMostRelevant(int limit) {
        List<Post> posts = postRepository.findAllPublishedByStatusWithComments(Status.ACTIVE);
        OffsetDateTime agora = OffsetDateTime.now();

        return posts.stream()
                .sorted(Comparator.comparingDouble((Post post) -> calculateRelevanceScore(post, agora)).reversed())
                .limit(limit)
                .map(postMapper::toResponseDTO)
                .toList();
    }

    /**
     * Creates a new post.
     *
     * @param postDTO The post data transfer object.
     * @return The created post, ResultPostDTO.
     */
    @Transactional
    @CacheEvict(value = "mostRelevantPosts", allEntries = true)
    public ResultPostDTO create(RequestPostDTO postDTO) {
        validateSlug(postDTO.slug());

        Category category = categoryRepository.findById(postDTO.categoryId())
                .orElseThrow(() -> new CategoryNotFoundException(postDTO.categoryId()));

        Author author = authorRepository.findById(postDTO.authorId())
                .orElseThrow(() -> new AuthorNotFoundException(postDTO.authorId()));

        UUID currentBlogId = TenantContext.getCurrentTenant();
        Blog currentBlog = blogRepository.findById(currentBlogId)
                .orElseThrow(() -> new EntityNotFoundException("Blog not found"));

        Post post = postMapper.toEntity(postDTO);
        post.setCategory(category);
        post.setAuthor(author);
        post.setBlog(currentBlog);

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
        List<Post> posts = postRepository.findAllWithRelations();
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
     * Increment the view counter of a post.
     *
     * @param slug Post slug
     */
    @Transactional
    public void incrementViews(String slug) {
        Post post = postRepository.findBySlug(slug)
                .orElseThrow(() -> new PostNotFoundException("slug", slug));
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
        return postRepository.findPostWithRelationsById(id)
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

    /**
     * Calculates a post's relevance score based on a combination of active engagement,
     * reach, and the time elapsed since publication (time-decay formula).
     *
     * @param post The post-entity for which the score is to be calculated.
     * @param now The current reference time used to calculate the post's age.
     * @return The final relevance score calculated for the post (higher values indicate greater relevance).
     */
    private double calculateRelevanceScore(Post post, OffsetDateTime now) {
        double views = getSafeValue(post.getViews());
        double likes = getSafeValue(post.getLikes());
        double comments = getSafeValue(post.getCommentsCount());

        long daysSincePublication = getDaysSincePublication(post.getPublishedAt(), now);

        // Fórmula: (views * 0.5) + (likes * 2) + (comments * 3) - (dias * 0.1)
        return (views * WEIGHT_VIEWS)
                + (likes * WEIGHT_LIKES)
                + (comments * WEIGHT_COMMENTS)
                - (daysSincePublication * DECAY_DAYS_PENALTY);
    }

    /**
     * Calculates the number of full days elapsed between the post's creation date
     * and the current reference time, ensuring the value is never negative.
     *
     * @param publishedAt The post's published time (OffsetDateTime).
     * @param now The current reference time.
     * @return The number of days elapsed since publication, returning 0 if the
     *         creation date is null or in the future.
     */
    private long getDaysSincePublication(OffsetDateTime publishedAt, OffsetDateTime now) {
        if (publishedAt == null) {
            return 0;
        }
        long dias = ChronoUnit.DAYS.between(publishedAt, now);
        return Math.max(0, dias);
    }

    /**
     * Safely converts integer-long post-metric values to double,
     * preventing NullPointerExceptions if the field is not initialized.
     *
     * @param value The Long value to check (maybe null).
     * @return The value converted to double, or 0.0 if the input parameter is null.
     */
    private double getSafeValue(Long value) {
        return value != null ? value.doubleValue() : 0.0;
    }
}