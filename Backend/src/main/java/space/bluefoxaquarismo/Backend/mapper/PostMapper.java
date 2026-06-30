package space.bluefoxaquarismo.Backend.mapper;

import org.mapstruct.Mapper;
import space.bluefoxaquarismo.Backend.dto.post.RequestPostDTO;
import space.bluefoxaquarismo.Backend.dto.post.ResultPostDTO;
import space.bluefoxaquarismo.Backend.entity.Post;

@Mapper(componentModel = "spring")
public interface PostMapper {

    /**
     * Mapeia o DTO de requisição para a entidade Post.
     */
    Post toEntity(RequestPostDTO dto);

    /**
     * Mapeia a entidade Post para o DTO de resposta.
     */
    ResultPostDTO toResponseDTO(Post entity);
}
