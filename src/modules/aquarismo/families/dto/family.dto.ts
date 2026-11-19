import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsIn, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, ValidateNested } from 'class-validator';
import { SUPPORTED_LOCALES } from '../../common/locale';

export class FamilyTranslationDto {
  @ApiProperty({ enum: SUPPORTED_LOCALES, example: 'pt-BR' })
  @IsIn(SUPPORTED_LOCALES as unknown as string[])
  locale: string;

  @ApiProperty({ example: 'Caracídeos (tetras)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateFamilyDto {
  @ApiProperty({ example: 'Characidae' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  scientificName: string;

  @ApiPropertyOptional({ example: 'characidae' })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(120)
  slug?: string;

  @ApiProperty({ type: [FamilyTranslationDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => FamilyTranslationDto)
  translations: FamilyTranslationDto[];
}

export class UpdateFamilyDto extends PartialType(CreateFamilyDto) {}
