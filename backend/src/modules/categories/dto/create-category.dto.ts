import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({
    description: 'Nome da categoria',
    example: 'Cuidados com Peixes',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O nome da categoria é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada da categoria',
    example: 'Guias específicos sobre comportamento, alimentação e longevidade.',
  })
  @IsNotEmpty({ message: 'A descrição da categoria é obrigatória.' })
  @IsString({ message: 'A descrição deve ser uma string.' })
  description: string;

  @ApiPropertyOptional({
    description: 'Slug único da categoria (se não informado, será gerado automaticamente a partir do nome)',
    example: 'cuidados-com-peixes',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'O slug deve ser uma string.' })
  @MaxLength(255, { message: 'O slug deve ter no máximo 255 caracteres.' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'O slug deve conter apenas letras minúsculas, números e hífens.',
  })
  slug?: string;
}
