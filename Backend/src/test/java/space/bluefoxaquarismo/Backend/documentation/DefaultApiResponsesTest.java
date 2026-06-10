package space.bluefoxaquarismo.Backend.documentation;

import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

import static org.junit.jupiter.api.Assertions.*;

class DefaultApiResponsesTest {

    @Test
    @DisplayName("Should have runtime retention")
    void shouldHaveRuntimeRetention() {

        Retention retention =
                DefaultApiResponses.class.getAnnotation(Retention.class);

        assertNotNull(retention);
        assertEquals(
                RetentionPolicy.RUNTIME,
                retention.value()
        );
    }

    @Test
    @DisplayName("Should have target method")
    void shouldHaveTargetMethod() {

        Target target =
                DefaultApiResponses.class.getAnnotation(Target.class);

        assertNotNull(target);

        assertArrayEquals(
                new java.lang.annotation.ElementType[]{
                        java.lang.annotation.ElementType.METHOD
                },
                target.value()
        );
    }

    @Test
    @DisplayName("Should contain swagger api responses")
    void shouldContainSwaggerApiResponses() {

        ApiResponses apiResponses =
                DefaultApiResponses.class.getAnnotation(ApiResponses.class);

        assertNotNull(apiResponses);
        assertEquals(
                2,
                apiResponses.value().length
        );
    }
}