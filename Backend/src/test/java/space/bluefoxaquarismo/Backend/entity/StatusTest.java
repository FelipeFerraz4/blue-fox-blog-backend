package space.bluefoxaquarismo.Backend.entity;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

public class StatusTest {

    @Test
    @DisplayName("Should contain all expected status values")
    void shouldContainAllStatusValues() {
        Status[] values = Status.values();

        assertEquals(5, values.length);
        assertArrayEquals(
                new Status[]{
                        Status.ACTIVE,
                        Status.INACTIVE,
                        Status.SUSPENDED,
                        Status.PENDING,
                        Status.DELETED
                }, values
        );
    }

    @Test
    @DisplayName("Should return enum from valueOf")
    void shouldReturnEnumUsingValueOf() {
        assertEquals(Status.ACTIVE, Status.valueOf("ACTIVE"));
        assertEquals(Status.INACTIVE, Status.valueOf("INACTIVE"));
        assertEquals(Status.SUSPENDED, Status.valueOf("SUSPENDED"));
        assertEquals(Status.PENDING, Status.valueOf("PENDING"));
        assertEquals(Status.DELETED, Status.valueOf("DELETED"));
    }

    @Test
    @DisplayName("Should throw exception for invalid enum value")
    void shouldThrowExceptionForInvalidEnumValue() {
        assertThrows(
                IllegalArgumentException.class,
                () -> Status.valueOf("INVALID_STATUS")
        );
    }
}
