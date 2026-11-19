import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsOptional, IsString, MaxLength } from 'class-validator';
import { SUPPORTED_LOCALES } from '../locale';

/** Converte "true"/"false"/"1"/"0" de query string em booleano (a conversão implícita trataria "false" como true). */
export const ToBoolean = () =>
  // Lê o valor original (obj[key]): com enableImplicitConversion, `value` já chegaria como Boolean("false") = true.
  Transform(({ obj, key }) => {
    const value: unknown = obj[key];
    if (value === undefined || value === null || value === '') return undefined;
    if (typeof value === 'boolean') return value;
    return ['true', '1', 'yes'].includes(String(value).toLowerCase());
  });

/** Parâmetro de idioma comum a todas as leituras do catálogo. */
export class LocaleQueryDto {
  @ApiPropertyOptional({
    description: `Response language (falls back to Accept-Language, then ${SUPPORTED_LOCALES[0]})`,
    enum: SUPPORTED_LOCALES,
    example: 'en',
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  lang?: string;
}

