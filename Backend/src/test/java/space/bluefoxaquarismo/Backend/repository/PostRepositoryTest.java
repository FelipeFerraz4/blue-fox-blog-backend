package space.bluefoxaquarismo.Backend.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import space.bluefoxaquarismo.Backend.config.AbstractIntegrationTest;
import space.bluefoxaquarismo.Backend.entity.Author;
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

    private Author defaultAuthor;
    private Category defaultCategory;

    @BeforeEach
    void setUp() {
        // Limpa a tabela de posts antes de cada teste para garantir isolamento
        postRepository.deleteAll();
        authorRepository.deleteAll();
        categoryRepository.deleteAll();

        defaultAuthor = Author.builder()
                .name("Leila Cunha Cardoso")
                .slug("leila-cunha")
                .email("leila@bluefoxaquarismo.space")
                .status(Status.ACTIVE)
                .build();
        authorRepository.save(defaultAuthor);

        defaultCategory = Category.builder()
                .name("Aquários Plantados")
                .description("Artigos e tutorias sobre montagem e manutenção de aquários plantados.") // <-- CORRIGIDO: Adicionado campo obrigatório
                .slug("aquarios-plantados")
                .status(Status.ACTIVE)
                .build();
        categoryRepository.save(defaultCategory);
    }

    @Test
    @DisplayName("Should find post by slug")
    void shouldFindPostBySlug() {
        Post post = Post.builder()
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
                .title("Post Ativo")
                .description("Desc...")
                .slug("post-ativo")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .build();

        Post inactivePost = Post.builder()
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
                .title("Post Público")
                .description("Desc...")
                .slug("post-publico")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .published(true)
                .build();

        Post draftPost = Post.builder()
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
        // Faz o mesmo para o autor
        assertThat(results)
                .extracting(p -> p.getAuthor().getId())
                .containsExactly(defaultAuthor.getId());
    }

    @Test
    @DisplayName("Should find all posts by category id")
    void shouldFindAllPostsByCategoryId() {
        Post post = Post.builder()
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
        // Extrai o ID da categoria do post retornado e compara com o ID esperado
        assertThat(results)
                .extracting(p -> p.getCategory().getId())
                .containsExactly(defaultCategory.getId());
    }

    @Test
    @DisplayName("Should find all posts by category id, published, and status")
    void shouldFindAllPostsByCategoryIdAndPublishedAndStatus() {
        Post targetPost = Post.builder()
                .title("Post Alvo")
                .description("Desc...")
                .slug("post-alvo")
                .author(defaultAuthor)
                .category(defaultCategory)
                .status(Status.ACTIVE)
                .published(true)
                .build();

        Post ignoredPost = Post.builder()
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