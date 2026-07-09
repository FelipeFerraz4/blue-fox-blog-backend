package space.bluefoxaquarismo.Backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
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
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "authorId", source = "author.id")
    @Mapping(target = "authorName", source = "author.name")
    ResultPostDTO toResponseDTO(Post entity);
}
