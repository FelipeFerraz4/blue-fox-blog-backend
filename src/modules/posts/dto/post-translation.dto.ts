import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SUPPORTED_LOCALES } from '../../../common/i18n/locale';

/** Título e descrição de um post em outro idioma (o padrão fica nos campos do próprio post). */
export class PostTranslationDto {
  @ApiProperty({ enum: SUPPORTED_LOCALES, example: 'en' })
  @IsIn(SUPPORTED_LOCALES as unknown as string[])
  locale: string;

  @ApiProperty({ example: 'Tetra Fish: What You Need to Know Before Buying' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'Thinking about buying tetras? Learn about schooling behaviour, tank size and water parameters.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  description: string;
}
