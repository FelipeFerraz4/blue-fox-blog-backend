package space.bluefoxaquarismo.Backend.mapper;

import org.mapstruct.Mapper;
import space.bluefoxaquarismo.Backend.dto.author.RequestAuthorDTO;
import space.bluefoxaquarismo.Backend.dto.author.ResultAuthorDTO;
import space.bluefoxaquarismo.Backend.entity.Author;



@Mapper(componentModel = "spring")
public interface AuthorMapper {
    /**
     * Mapeia o DTO de requisição para a entidade Author.
     */
    Author toEntity(RequestAuthorDTO dto);

    /**
     * Mapeia a entidade Category para o DTO de resposta.
     */
    ResultAuthorDTO toResponseDTO(Author entity);
}