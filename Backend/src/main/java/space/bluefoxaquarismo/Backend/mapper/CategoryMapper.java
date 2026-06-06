package space.bluefoxaquarismo.Backend.mapper;

import org.springframework.stereotype.Component;
import space.bluefoxaquarismo.Backend.dto.category.RequestCategoryDTO;
import space.bluefoxaquarismo.Backend.dto.category.ResultCategoryDTO;
import space.bluefoxaquarismo.Backend.entity.Category;

@Component
public class CategoryMapper {

    public Category toEntity(RequestCategoryDTO dto){
        return Category.builder()
                .name(dto.name())
                .description(dto.description())
                .slug(dto.slug())
                .build();
    }

    public ResultCategoryDTO toResponseDTO(Category entity){
        return new ResultCategoryDTO(
                entity.getId(),
                entity.getName(),
                entity.getDescription(),
                entity.getSlug()
        );
    }
}
