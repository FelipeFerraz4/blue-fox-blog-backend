package space.bluefoxaquarismo.Backend.dto.category;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import space.bluefoxaquarismo.Backend.entity.Status;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UpdateCategoryStatusDTOTest {

    @Test
    @DisplayName("Should create update category status dto")
    void shouldCreateUpdateCategoryStatusDTO() {

        UpdateCategoryStatusDTO dto =
                new UpdateCategoryStatusDTO(Status.ACTIVE);

        assertEquals(
                Status.ACTIVE,
                dto.status()
        );
    }
}