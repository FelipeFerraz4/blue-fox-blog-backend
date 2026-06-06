package space.bluefoxaquarismo.Backend.repository;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase.Replace;
import space.bluefoxaquarismo.Backend.config.AbstractIntegrationTest;
import space.bluefoxaquarismo.Backend.entity.Category;
import space.bluefoxaquarismo.Backend.entity.Status;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@AutoConfigureTestDatabase(replace = Replace.NONE)
class CategoryRepositoryTest extends AbstractIntegrationTest {

    @Autowired
    private CategoryRepository categoryRepository;

    @Test
    @DisplayName("Should find category by name")
    void shouldFindCategoryByName() {

        Category category = Category.builder()
                .name("Fish Care")
                .description("Content related to fish care")
                .slug("fish-care")
                .status(Status.ACTIVE)
                .build();

        categoryRepository.save(category);

        Optional<Category> foundCategory =
                categoryRepository.findByName("Fish Care");

        assertThat(foundCategory).isPresent();
        assertThat(foundCategory.get().getName())
                .isEqualTo("Fish Care");
    }

    @Test
    @DisplayName("Should return empty when category name does not exist")
    void shouldReturnEmptyWhenCategoryNameDoesNotExist() {

        Optional<Category> foundCategory =
                categoryRepository.findByName("Unknown");

        assertThat(foundCategory).isEmpty();
    }

    @Test
    @DisplayName("Should find category by slug")
    void shouldFindCategoryBySlug() {

        Category category = Category.builder()
                .name("Aquarium Plants")
                .description("Plants category")
                .slug("aquarium-plants")
                .status(Status.ACTIVE)
                .build();

        categoryRepository.save(category);

        Optional<Category> foundCategory =
                categoryRepository.findBySlug("aquarium-plants");

        assertThat(foundCategory).isPresent();
        assertThat(foundCategory.get().getSlug())
                .isEqualTo("aquarium-plants");
    }

    @Test
    @DisplayName("Should return true when category exists by name")
    void shouldReturnTrueWhenCategoryExistsByName() {

        Category category = Category.builder()
                .name("Shrimps")
                .description("Shrimp category")
                .slug("shrimps")
                .status(Status.ACTIVE)
                .build();

        categoryRepository.save(category);

        boolean exists =
                categoryRepository.existsByName("Shrimps");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when category does not exist by name")
    void shouldReturnFalseWhenCategoryDoesNotExistByName() {

        boolean exists =
                categoryRepository.existsByName("Unknown");

        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should return true when category exists by slug")
    void shouldReturnTrueWhenCategoryExistsBySlug() {

        Category category = Category.builder()
                .name("Corals")
                .description("Coral category")
                .slug("corals")
                .status(Status.ACTIVE)
                .build();

        categoryRepository.save(category);

        boolean exists =
                categoryRepository.existsBySlug("corals");

        assertThat(exists).isTrue();
    }

    @Test
    @DisplayName("Should return false when category does not exist by slug")
    void shouldReturnFalseWhenCategoryDoesNotExistBySlug() {

        boolean exists =
                categoryRepository.existsBySlug("unknown");

        assertThat(exists).isFalse();
    }

    @Test
    @DisplayName("Should find all categories by status")
    void shouldFindAllCategoriesByStatus() {

        Category activeCategory = Category.builder()
                .name("Fresh Water")
                .description("Fresh water fish")
                .slug("fresh-water")
                .status(Status.ACTIVE)
                .build();

        Category inactiveCategory = Category.builder()
                .name("Salt Water")
                .description("Salt water fish")
                .slug("salt-water")
                .status(Status.INACTIVE)
                .build();

        categoryRepository.save(activeCategory);
        categoryRepository.save(inactiveCategory);

        List<Category> activeCategories =
                categoryRepository.findAllByStatus(Status.ACTIVE);

        assertThat(activeCategories).hasSize(1);

        assertThat(activeCategories.getFirst().getName())
                .isEqualTo("Fresh Water");

        assertThat(activeCategories.getFirst().getStatus())
                .isEqualTo(Status.ACTIVE);
    }
}