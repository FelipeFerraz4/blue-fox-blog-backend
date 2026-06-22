package space.bluefoxaquarismo.Backend.dto.category;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import space.bluefoxaquarismo.Backend.entity.Status;

import static org.junit.jupiter.api.Assertions.assertEquals;

class UpdateStatusDTOTest {

    @Test
    @DisplayName("Should create update category status dto")
    void shouldCreateUpdateCategoryStatusDTO() {

        UpdateStatusDTO dto =
                new UpdateStatusDTO(Status.ACTIVE);

        assertEquals(
                Status.ACTIVE,
                dto.status()
        );
    }
}