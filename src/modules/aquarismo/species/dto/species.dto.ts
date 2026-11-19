import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  AquarismoBreeding,
  AquarismoDiet,
  AquarismoDifficulty,
  AquarismoLevel,
  AquarismoPublication,
  AquarismoSwimLayer,
  AquarismoTemperament,
  AquarismoWaterType,
} from '@prisma/client';
import { LocaleQueryDto, ToBoolean } from '../../common/dto/catalog-query.dto';
import { SUPPORTED_LOCALES } from '../../common/locale';

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export class SpeciesTranslationDto {
  @ApiProperty({ enum: SUPPORTED_LOCALES, example: 'pt-BR' })
  @IsIn(SUPPORTED_LOCALES as unknown as string[])
  locale: string;

  @ApiProperty({ example: 'Tetra-neon' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  commonName: string;

  @ApiPropertyOptional({ type: [String], example: ['Neon'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  otherNames?: string[];

  @ApiPropertyOptional({ example: 'Afluentes dos rios Negro, Solimões e Purus' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  region?: string;

  @ApiProperty({ example: 'Pequeno tetra de cardume, pacífico...' })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  careNotes?: string;
}

export class CreateSpeciesDto {
  @ApiPropertyOptional({ description: 'Generated from the scientific name when omitted', example: 'paracheirodon-innesi' })
  @IsOptional()
  @Matches(SLUG, { message: 'slug must contain only lowercase letters, numbers and hyphens' })
  @MaxLength(160)
  slug?: string;

  @ApiProperty({ example: 'Paracheirodon innesi' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(160)
  scientificName: string;

  @ApiPropertyOptional({ description: 'Family id (UUID)' })
  @IsOptional()
  @IsUUID()
  familyId?: string;

  @ApiPropertyOptional({ type: [String], description: 'Biome ids (UUID)' })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('all', { each: true })
  biomeIds?: string[];

  @ApiPropertyOptional({ enum: AquarismoWaterType, default: AquarismoWaterType.FRESH })
  @IsOptional()
  @IsEnum(AquarismoWaterType)
  waterType?: AquarismoWaterType;

  @ApiProperty({ example: 4, description: 'Adult size (cm)' })
  @IsNumber()
  @Min(0.5)
  @Max(300)
  adultSizeCm: number;

  @ApiProperty({ example: 60, description: 'Minimum tank volume (L)' })
  @IsInt()
  @Min(1)
  minVolumeL: number;

  @ApiProperty({ example: 60, description: 'Minimum tank length (cm)' })
  @IsInt()
  @Min(1)
  minTankLengthCm: number;

  @ApiPropertyOptional({ example: 6, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  minGroupSize?: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @Min(0)
  @Max(40)
  tempMinC: number;

  @ApiProperty({ example: 26 })
  @IsNumber()
  @Min(0)
  @Max(40)
  tempMaxC: number;

  @ApiProperty({ example: 5.5 })
  @IsNumber()
  @Min(0)
  @Max(14)
  phMin: number;

  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(0)
  @Max(14)
  phMax: number;

  @ApiPropertyOptional({ example: 1, description: 'General hardness (°dGH)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  ghMin?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  ghMax?: number;

  @ApiProperty({ enum: AquarismoTemperament })
  @IsEnum(AquarismoTemperament)
  temperament: AquarismoTemperament;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  finNipper?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  longFinned?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  territorial?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Males of the same species fight each other' })
  @IsOptional()
  @IsBoolean()
  conspecificAggression?: boolean;

  @ApiProperty({ enum: AquarismoSwimLayer, isArray: true, example: ['MIDDLE'] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayUnique()
  @IsEnum(AquarismoSwimLayer, { each: true })
  layers: AquarismoSwimLayer[];

  @ApiPropertyOptional({ enum: AquarismoLevel, default: AquarismoLevel.MEDIUM })
  @IsOptional()
  @IsEnum(AquarismoLevel)
  activity?: AquarismoLevel;

  @ApiProperty({ enum: AquarismoDifficulty })
  @IsEnum(AquarismoDifficulty)
  difficulty: AquarismoDifficulty;

  @ApiProperty({ enum: AquarismoDiet })
  @IsEnum(AquarismoDiet)
  diet: AquarismoDiet;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  needsPlants?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  needsHiding?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  eatsPlants?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  jumps?: boolean;

  @ApiPropertyOptional({ enum: AquarismoBreeding, default: AquarismoBreeding.MODERATE })
  @IsOptional()
  @IsEnum(AquarismoBreeding)
  breeding?: AquarismoBreeding;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  suitableForBreedingSale?: boolean;

  @ApiPropertyOptional({ example: 'assets/images/fish/paracheirodon-innesi.webp' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  imageUrl?: string;

  @ApiPropertyOptional({ type: [String], example: ['https://www.seriouslyfish.com/species/paracheirodon-innesi/'] })
  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  sources?: string[];

  @ApiPropertyOptional({ example: '2026-11-19T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  lastReviewedAt?: string;

  @ApiPropertyOptional({ enum: AquarismoPublication, default: AquarismoPublication.DRAFT })
  @IsOptional()
  @IsEnum(AquarismoPublication)
  publication?: AquarismoPublication;

  @ApiProperty({ type: [SpeciesTranslationDto], description: 'At least the default locale (pt-BR)' })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SpeciesTranslationDto)
  translations: SpeciesTranslationDto[];
}

/** Atualização parcial; traduções enviadas são criadas ou substituídas por idioma. */
export class UpdateSpeciesDto extends PartialType(CreateSpeciesDto) {}

export class SpeciesQueryDto extends LocaleQueryDto {
  @ApiPropertyOptional({ description: 'Search by common or scientific name' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional({ enum: AquarismoWaterType })
  @IsOptional()
  @IsEnum(AquarismoWaterType)
  waterType?: AquarismoWaterType;

  @ApiPropertyOptional({ description: 'Species tolerating this temperature (°C)', example: 25 })
  @IsOptional()
  @IsNumber()
  temperature?: number;

  @ApiPropertyOptional({ description: 'Species tolerating this pH', example: 6.8 })
  @IsOptional()
  @IsNumber()
  ph?: number;

  @ApiPropertyOptional({ description: 'Tank volume (L): species whose minimum fits', example: 100 })
  @IsOptional()
  @IsInt()
  @Min(1)
  volume?: number;

  @ApiPropertyOptional({ description: 'Tank length (cm): species whose minimum fits', example: 80 })
  @IsOptional()
  @IsInt()
  @Min(1)
  tankLength?: number;

  @ApiPropertyOptional({ enum: AquarismoTemperament })
  @IsOptional()
  @IsEnum(AquarismoTemperament)
  temperament?: AquarismoTemperament;

  @ApiPropertyOptional({ enum: AquarismoDifficulty })
  @IsOptional()
  @IsEnum(AquarismoDifficulty)
  difficulty?: AquarismoDifficulty;

  @ApiPropertyOptional({ enum: AquarismoSwimLayer })
  @IsOptional()
  @IsEnum(AquarismoSwimLayer)
  layer?: AquarismoSwimLayer;

  @ApiPropertyOptional({ description: 'Biome slug', example: 'amazonia' })
  @IsOptional()
  @Matches(SLUG)
  biome?: string;

  @ApiPropertyOptional({ description: 'Family slug', example: 'characidae' })
  @IsOptional()
  @Matches(SLUG)
  family?: string;

  @ApiPropertyOptional({ description: 'Only species that are not fin nippers' })
  @IsOptional()
  @ToBoolean()
  @IsBoolean()
  noFinNippers?: boolean;
}
