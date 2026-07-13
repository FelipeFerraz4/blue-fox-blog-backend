package space.bluefoxaquarismo.Backend.repository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import space.bluefoxaquarismo.Backend.config.AbstractIntegrationTest;
import space.bluefoxaquarismo.Backend.config.tenant.TenantContext;
import space.bluefoxaquarismo.Backend.entity.Author;
import space.bluefoxaquarismo.Backend.entity.Blog;
import space.bluefoxaquarismo.Backend.entity.Category;
import space.bluefoxaquarismo.Backend.entity.Post;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class PostRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private AuthorRepository authorRepository;

    @Autowired
    private CategoryRepository categoryRepository;

    @Autowired
    private BlogRepository blogRepository;

    private Author defaultAuthor;
    private Category defaultCategory;
    private Blog defaultBlog;

    @BeforeEach
    void setUp() {
        postRepository.deleteAll();
        categoryRepository.deleteAll();
        authorRepository.deleteAll();
        blogRepository.deleteAll();

        defaultBlog = Blog.builder()
                .name("Blue Fox Aquarismo")
                .slug("blue-fox-aquarismo")
                .status(Status.ACTIVE)
                .build();
        defaultBlog = blogRepository.save(defaultBlog);

        TenantContext.setCurrentTenant(defaultBlog.getId());

        defaultAuthor = Author.builder()
                .blog(defaultBlog)
                .name("Leila Cunha Cardoso")
                .slug("leila-cunha")
                .email("leila@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();
        authorRepository.save(defaultAuthor);

        defaultCategory = Category.builder()
                .blog(defaultBlog)
                .name("Aquários Plantados")
                .description("Artigos e tutorias sobre montagem e manutenção de aquários plantados.")
                .slug("aquarios-plantados")
                .status(Status.ACTIVE)
                .build();
        categoryRepository.save(defaultCategory);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    @DisplayName("Should find post by slug")
    void shouldFindPostBySlug() {
        Post post = Post.builder()
                .blog(defaultBlog)
                .title("Como montar seu primeiro aquário plantado")
                .description("Um guia passo a passo completo...")
                .slug("como-montar-aquario-plantado")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .published(true)
                .build();
        postRepository.save(post);

        Optional<Post> foundPost = postRepository.findBySlug("como-montar-aquario-plantado");

        assertThat(foundPost).isPresent();
        assertThat(foundPost.get().getSlug()).isEqualTo("como-montar-aquario-plantado");
        assertThat(foundPost.get().getTitle()).isEqualTo("Como montar seu primeiro aquário plantado");
    }

    @Test
    @DisplayName("Should return empty when post slug does not exist")
    void shouldReturnEmptyWhenPostSlugDoesNotExist() {
        Optional<Post> foundPost = postRepository.findBySlug("slug-inexistente");

        assertThat(foundPost).isEmpty();
    }

    @Test
    @DisplayName("Should return true when post exists by slug")
    void shouldReturnTrueWhenPostExistsBySlug() {
        Post post = Post.builder()
                .blog(defaultBlog)
                .title("Alimentação de Peixes")
                .description("Dicas sobre rações...")
                .slug("alimentacao-de-peixes")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .build();
        postRepository.save(post);

        boolean exists = postRepository.existsBySlug("alimentacao-de-peixes");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when post does not exist by slug")
    void shouldReturnFalseWhenPostDoesNotExistBySlug() {
        boolean exists = postRepository.existsBySlug("slug-falso");

        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should find all posts by status")
    void shouldFindAllPostsByStatus() {
        Post activePost = Post.builder()
                .blog(defaultBlog)
                .title("Post Ativo")
                .description("Desc...")
                .slug("post-ativo")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .build();

        Post inactivePost = Post.builder()
                .blog(defaultBlog)
                .title("Post Inativo")
                .description("Desc...")
                .slug("post-inativo")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.INACTIVE)
                .build();

        postRepository.saveAll(List.of(activePost, inactivePost));

        List<Post> activePosts = postRepository.findAllByStatus(Status.ACTIVE);

        assertThat(activePosts)
                .isNotEmpty()
                .extracting(Post::getSlug)
                .contains("post-ativo")
                .doesNotContain("post-inativo");
    }

    @Test
    @DisplayName("Should find all posts by published and status")
    void shouldFindAllPostsByPublishedAndStatus() {
        Post publicPost = Post.builder()
                .blog(defaultBlog)
                .title("Post Público")
                .description("Desc...")
                .slug("post-publico")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .published(true)
                .build();

        Post draftPost = Post.builder()
                .blog(defaultBlog)
                .title("Rascunho")
                .description("Desc...")
                .slug("rascunho")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .published(false)
                .build();

        postRepository.saveAll(List.of(publicPost, draftPost));

        List<Post> results = postRepository.findAllByPublishedAndStatus(true, Status.ACTIVE);

        assertThat(results)
                .hasSize(1)
                .extracting(Post::getSlug)
                .containsExactly("post-publico");
    }

    @Test
    @DisplayName("Should find all posts by author id")
    void shouldFindAllPostsByAuthorId() {
        Post post = Post.builder()
                .blog(defaultBlog)
                .title("Post da Leila")
                .description("Desc...")
                .slug("post-da-leila")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .build();
        postRepository.save(post);

        List<Post> results = postRepository.findAllByAuthorId(defaultAuthor.getId());

        assertThat(results).hasSize(1);
        assertThat(results)
                .extracting(p -> p.getAuthor().getId())
                .containsExactly(defaultAuthor.getId());
    }

    @Test
    @DisplayName("Should find all posts by category id")
    void shouldFindAllPostsByCategoryId() {
        Post post = Post.builder()
                .blog(defaultBlog)
                .title("Post de Plantados")
                .description("Desc...")
                .slug("post-de-plantados")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .build();
        postRepository.save(post);

        List<Post> results = postRepository.findAllByCategoryId(defaultCategory.getId());

        assertThat(results).hasSize(1);
        assertThat(results)
                .extracting(p -> p.getCategory().getId())
                .containsExactly(defaultCategory.getId());
    }

    @Test
    @DisplayName("Should find all posts by category id, published, and status")
    void shouldFindAllPostsByCategoryIdAndPublishedAndStatus() {
        Post targetPost = Post.builder()
                .blog(defaultBlog)
                .title("Post Alvo")
                .description("Desc...")
                .slug("post-alvo")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .published(true)
                .build();

        Post ignoredPost = Post.builder()
                .blog(defaultBlog)
                .title("Post Oculto")
                .description("Desc...")
                .slug("post-oculto")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.DELETED)
                .published(true)
                .build();

        postRepository.saveAll(List.of(targetPost, ignoredPost));

        List<Post> results = postRepository.findAllByCategoryIdAndPublishedAndStatus(
                defaultCategory.getId(), true, Status.ACTIVE);

        assertThat(results)
                .hasSize(1)
                .extracting(Post::getSlug)
                .containsExactly("post-alvo");
    }
}