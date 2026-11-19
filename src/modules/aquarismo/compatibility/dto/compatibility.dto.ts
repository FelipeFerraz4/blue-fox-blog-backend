import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  ValidateNested,
} from 'class-validator';
import { AquarismoCompatibilityOverride } from '@prisma/client';
import { LocaleQueryDto } from '../../common/dto/catalog-query.dto';
import { SUPPORTED_LOCALES } from '../../common/locale';

export class CompatibilityQueryDto extends LocaleQueryDto {
  @ApiProperty({
    description:
      'Comma-separated species slugs (up to 20), optionally with the sex: slug:male or slug:female. ' +
      'Sex matters for species whose males behave differently (e.g. betta); without it, male is assumed. ' +
      'Repeat an entry to say there is more than one individual (betta-splendens:female,betta-splendens:female).',
    example: 'paracheirodon-innesi,corydoras-aeneus,betta-splendens:female',
    type: String,
  })
  @Transform(({ obj }) =>
    String(obj.species ?? '')
      .split(',')
      .map((s: string) => s.trim())
      .filter(Boolean),
  )
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(20)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*(?::(?:male|female))?$/, {
    each: true,
    message: 'each species must be a slug, optionally followed by :male or :female',
  })
  species: string[];
}

export class CompatibilityNoteDto {
  @ApiProperty({ enum: SUPPORTED_LOCALES, example: 'pt-BR' })
  @IsIn(SUPPORTED_LOCALES as unknown as string[])
  locale: string;

  @ApiProperty({ example: 'Em aquários grandes e bem plantados, a convivência costuma ser tranquila.' })
  @IsString()
  @IsNotEmpty()
  note: string;
}

export class UpsertCompatibilityOverrideDto {
  @ApiProperty({ description: 'Species id (UUID)' })
  @IsUUID()
  speciesAId: string;

  @ApiProperty({ description: 'Species id (UUID)' })
  @IsUUID()
  speciesBId: string;

  @ApiProperty({ enum: AquarismoCompatibilityOverride })
  @IsEnum(AquarismoCompatibilityOverride)
  override: AquarismoCompatibilityOverride;

  @ApiPropertyOptional({ type: [CompatibilityNoteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CompatibilityNoteDto)
  notes?: CompatibilityNoteDto[];
}
