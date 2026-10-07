import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @ApiProperty({
    description: 'ID do post ao qual o comentário pertence',
    example: '9f000001-28ab-4add-bbbb-112233445566',
  })
  @IsNotEmpty({ message: 'O ID do post é obrigatório' })
  @IsUUID('all', { message: 'ID do post deve ser um UUID válido' })
  postId: string;

  @ApiProperty({
    description: 'Conteúdo do comentário',
    example: 'Excelente artigo! Ajudou muito na escolha do meu primeiro aquário.',
  })
  @IsNotEmpty({ message: 'O conteúdo do comentário é obrigatório' })
  @IsString({ message: 'O conteúdo deve ser um texto' })
  content: string;

  @ApiProperty({
    description: 'Nome do autor do comentário',
    example: 'Carlos Silva',
    maxLength: 255,
  })
  @IsNotEmpty({ message: 'O nome do autor do comentário é obrigatório' })
  @IsString({ message: 'O nome do autor deve ser um texto' })
  @MaxLength(255, { message: 'O nome do autor deve ter no máximo 255 caracteres' })
  authorName: string;
}
