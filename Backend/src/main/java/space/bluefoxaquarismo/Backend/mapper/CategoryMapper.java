package space.bluefoxaquarismo.Backend.mapper;

import org.mapstruct.Mapper;
import space.bluefoxaquarismo.Backend.dto.category.RequestCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.ResultCategoryDTO;
import space.bluefoxaquarismo.Backend.entity.Category;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    /**
     * Mapeia o DTO de requisição para a entidade Category.
     * O MapStruct usará automaticamente o Builder do Lombok da sua entidade.
     */
    Category toEntity(RequestCategoryDTO dto);

    /**
     * Mapeia a entidade Category para o DTO de resposta.
     * O MapStruct passará os valores para o construtor do seu Record.
     */
    ResultCategoryDTO toResponseDTO(Category entity);
}