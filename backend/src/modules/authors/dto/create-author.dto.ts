import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEmail, MaxLength, Matches, IsOptional } from 'class-validator';

export class CreateAuthorDto {
  @ApiProperty({
    description: 'Nome completo do autor',
    example: 'Felipe Ferraz',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O nome do autor é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MaxLength(255, { message: 'O nome deve ter no máximo 255 caracteres.' })
  name: string;

  @ApiPropertyOptional({
    description: 'Biografia resumida do autor',
    example: 'Computer Scientist and Aquarist passionate about creating digital experiences.',
  })
  @IsOptional()
  @IsString({ message: 'A biografia deve ser uma string.' })
  bio?: string;

  @ApiPropertyOptional({
    description: 'URL da imagem de perfil do autor',
    example: 'assets/images/authors/felipe-ferraz.webp',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'A URL da foto de perfil deve ser uma string.' })
  @MaxLength(255, { message: 'A URL da foto deve ter no máximo 255 caracteres.' })
  profilePictureUrl?: string;

  @ApiPropertyOptional({
    description: 'Slug único do autor (se não informado, será gerado automaticamente a partir do nome)',
    example: 'felipe-ferraz',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'O slug deve ser uma string.' })
  @MaxLength(255, { message: 'O slug deve ter no máximo 255 caracteres.' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'O slug deve conter apenas letras minúsculas, números e hífens.',
  })
  slug?: string;

  @ApiProperty({
    description: 'E-mail profissional do autor',
    example: 'felipeferraz@bluefoxaquarismo.space',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O e-mail é obrigatório.' })
  @IsEmail({}, { message: 'Formato de e-mail inválido.' })
  @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres.' })
  email: string;
}
