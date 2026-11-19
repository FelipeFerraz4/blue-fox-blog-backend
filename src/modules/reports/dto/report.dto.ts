import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReportStatus, ReportTargetType } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

const trim = () => Transform(({ value }) => (typeof value === 'string' ? value.trim() : value));
const emptyToUndefined = () => Transform(({ value }) => (typeof value === 'string' && value.trim() === '' ? undefined : value));

export class CreateReportDto {
  @ApiProperty({ enum: ReportTargetType, example: ReportTargetType.SPECIES })
  @IsEnum(ReportTargetType)
  targetType: ReportTargetType;

  @ApiProperty({ example: 'paracheirodon-innesi' })
  @trim()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, { message: 'targetSlug must be a slug' })
  @MaxLength(255)
  targetSlug: string;

  @ApiPropertyOptional({ example: 'Tetra-neon' })
  @IsOptional()
  @trim()
  @IsString()
  @MaxLength(255)
  targetTitle?: string;

  @ApiPropertyOptional({ example: 'https://bluefoxaquarismo.space/articles/tetra-fish-guide' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  pageUrl?: string;

  @ApiProperty({ description: 'What is wrong', example: 'A temperatura máxima do Neon está errada.' })
  @trim()
  @IsString()
  @IsNotEmpty()
  @MinLength(10, { message: 'Describe the problem in at least 10 characters' })
  @MaxLength(2000)
  message: string;

  @ApiPropertyOptional({ description: 'Suggested correction' })
  @IsOptional()
  @trim()
  @emptyToUndefined()
  @IsString()
  @MaxLength(2000)
  suggestion?: string;

  @ApiPropertyOptional({ description: 'Source (link or reference)' })
  @IsOptional()
  @trim()
  @emptyToUndefined()
  @IsString()
  @MaxLength(500)
  source?: string;

  @ApiPropertyOptional({ description: 'Optional, only to reply to the reader' })
  @IsOptional()
  @trim()
  @emptyToUndefined()
  @IsEmail({}, { message: 'email must be a valid e-mail address' })
  @MaxLength(255)
  email?: string;

  /** Campo-isca (honeypot): fica escondido no formulário; pessoas deixam vazio, robôs preenchem. */
  @ApiPropertyOptional({ description: 'Honeypot: must be empty' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  website?: string;
}

export class UpdateReportDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ description: 'Internal note (never shown to the reader)' })
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  internalNote?: string;
}

export class ReportQueryDto {
  @ApiPropertyOptional({ enum: ReportStatus })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ enum: ReportTargetType })
  @IsOptional()
  @IsEnum(ReportTargetType)
  targetType?: ReportTargetType;

  @ApiPropertyOptional({ description: 'Filter by target slug' })
  @IsOptional()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  targetSlug?: string;
}
