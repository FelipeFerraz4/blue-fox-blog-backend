import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { AquarismoLevel, AquarismoPublication, AquarismoTechLevel, AquarismoWaterType } from '@prisma/client';
import { LocaleQueryDto } from '../../common/dto/catalog-query.dto';
import { SUPPORTED_LOCALES } from '../../common/locale';

export class BiomeTranslationDto {
  @ApiProperty({ enum: SUPPORTED_LOCALES, example: 'pt-BR' })
  @IsIn(SUPPORTED_LOCALES as unknown as string[])
  locale: string;

  @ApiProperty({ example: 'Amazônia' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  name: string;

  @ApiPropertyOptional({ example: 'Bacia amazônica, América do Sul' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  region?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  substrate?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  hardscape?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  plants?: string;
}

export class CreateBiomeDto {
  @ApiProperty({ example: 'amazonia' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(160)
  slug: string;

  @ApiPropertyOptional({ enum: AquarismoWaterType, default: AquarismoWaterType.FRESH })
  @IsOptional()
  @IsEnum(AquarismoWaterType)
  waterType?: AquarismoWaterType;

  @ApiProperty({ example: 24 })
  @IsNumber()
  @Min(0)
  @Max(40)
  tempMinC: number;

  @ApiProperty({ example: 28 })
  @IsNumber()
  @Min(0)
  @Max(40)
  tempMaxC: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(0)
  @Max(14)
  phMin: number;

  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(0)
  @Max(14)
  phMax: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  ghMin?: number;

  @ApiPropertyOptional({ example: 8 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  ghMax?: number;

  @ApiPropertyOptional({ enum: AquarismoLevel, default: AquarismoLevel.LOW })
  @IsOptional()
  @IsEnum(AquarismoLevel)
  current?: AquarismoLevel;

  @ApiPropertyOptional({ enum: AquarismoLevel, default: AquarismoLevel.MEDIUM })
  @IsOptional()
  @IsEnum(AquarismoLevel)
  light?: AquarismoLevel;

  @ApiPropertyOptional({ enum: AquarismoTechLevel, default: AquarismoTechLevel.LOW })
  @IsOptional()
  @IsEnum(AquarismoTechLevel)
  techLevel?: AquarismoTechLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @ApiPropertyOptional({ enum: AquarismoPublication, default: AquarismoPublication.DRAFT })
  @IsOptional()
  @IsEnum(AquarismoPublication)
  publication?: AquarismoPublication;

  @ApiProperty({ type: [BiomeTranslationDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => BiomeTranslationDto)
  translations: BiomeTranslationDto[];
}

export class UpdateBiomeDto extends PartialType(CreateBiomeDto) {}

export class BiomeQueryDto extends LocaleQueryDto {
  @ApiPropertyOptional({ enum: AquarismoWaterType })
  @IsOptional()
  @IsEnum(AquarismoWaterType)
  waterType?: AquarismoWaterType;

  @ApiPropertyOptional({ enum: AquarismoTechLevel })
  @IsOptional()
  @IsEnum(AquarismoTechLevel)
  techLevel?: AquarismoTechLevel;
}
