import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  AquarismoEquipmentType,
  AquarismoPublication,
  AquarismoSizingUnit,
  AquarismoTechLevel,
  AquarismoWaterType,
} from '@prisma/client';
import { LocaleQueryDto } from '../../common/dto/catalog-query.dto';
import { SUPPORTED_LOCALES } from '../../common/locale';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class EquipmentTranslationDto {
  @ApiProperty({ enum: SUPPORTED_LOCALES, example: 'pt-BR' })
  @IsIn(SUPPORTED_LOCALES as unknown as string[])
  locale: string;

  @ApiProperty({ example: 'Aquecedor com termostato' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional({ example: 'De 0,5 a 1 W por litro; em ambientes frios, fique perto de 1 W/L.' })
  @IsOptional()
  @IsString()
  sizingNote?: string;
}

export class CreateEquipmentDto {
  @ApiProperty({ example: 'aquecedor' })
  @Matches(SLUG)
  @MaxLength(160)
  slug: string;

  @ApiProperty({ enum: AquarismoEquipmentType })
  @IsEnum(AquarismoEquipmentType)
  type: AquarismoEquipmentType;

  @ApiProperty({ enum: AquarismoWaterType, isArray: true, example: ['FRESH'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(AquarismoWaterType, { each: true })
  waterTypes: AquarismoWaterType[];

  @ApiPropertyOptional({ enum: AquarismoTechLevel, default: AquarismoTechLevel.LOW })
  @IsOptional()
  @IsEnum(AquarismoTechLevel)
  techLevel?: AquarismoTechLevel;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minVolumeL?: number;

  @ApiPropertyOptional({ example: 500 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxVolumeL?: number;

  @ApiPropertyOptional({ enum: AquarismoSizingUnit, default: AquarismoSizingUnit.NONE })
  @IsOptional()
  @IsEnum(AquarismoSizingUnit)
  sizingUnit?: AquarismoSizingUnit;

  @ApiPropertyOptional({ example: 0.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizingMin?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  sizingMax?: number;

  @ApiPropertyOptional({ description: 'Slug of the related Aquarismo article', example: 'how-to-choose-aquarium-filter' })
  @IsOptional()
  @Matches(SLUG)
  @MaxLength(255)
  guideSlug?: string;

  @ApiPropertyOptional({ enum: AquarismoPublication, default: AquarismoPublication.DRAFT })
  @IsOptional()
  @IsEnum(AquarismoPublication)
  publication?: AquarismoPublication;

  @ApiProperty({ type: [EquipmentTranslationDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => EquipmentTranslationDto)
  translations: EquipmentTranslationDto[];
}

export class UpdateEquipmentDto extends PartialType(CreateEquipmentDto) {}

export class EquipmentQueryDto extends LocaleQueryDto {
  @ApiPropertyOptional({ enum: AquarismoEquipmentType })
  @IsOptional()
  @IsEnum(AquarismoEquipmentType)
  type?: AquarismoEquipmentType;

  @ApiPropertyOptional({ enum: AquarismoWaterType })
  @IsOptional()
  @IsEnum(AquarismoWaterType)
  waterType?: AquarismoWaterType;

  @ApiPropertyOptional({ enum: AquarismoTechLevel })
  @IsOptional()
  @IsEnum(AquarismoTechLevel)
  techLevel?: AquarismoTechLevel;

  @ApiPropertyOptional({ description: 'Tank volume (L): equipment whose volume range covers it', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  volume?: number;
}
