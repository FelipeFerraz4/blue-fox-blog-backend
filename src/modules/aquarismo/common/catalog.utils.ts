import { BadRequestException } from '@nestjs/common';
import { AquarismoPublication, Status } from '@prisma/client';
import { DEFAULT_LOCALE } from './locale';

/**
 * Filtro de visibilidade do catálogo (mesma regra dos posts): o público só vê itens PUBLISHED e ACTIVE;
 * quem gerencia conteúdo (`canSeeUnpublished`) vê rascunhos e revisados, mas nunca os removidos.
 */
export function visibilityWhere(canSeeUnpublished: boolean) {
  return canSeeUnpublished
    ? { status: { not: Status.DELETED } }
    : { status: Status.ACTIVE, publication: AquarismoPublication.PUBLISHED };
}

/** Mesma regra de `visibilityWhere`, para itens já carregados (ex.: relações incluídas). */
export function isVisible(item: { status: Status; publication: AquarismoPublication }, canSeeUnpublished: boolean): boolean {
  return canSeeUnpublished
    ? item.status !== Status.DELETED
    : item.status === Status.ACTIVE && item.publication === AquarismoPublication.PUBLISHED;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Toda entidade nova precisa da tradução no idioma padrão (é o fallback dos outros). */
export function requireDefaultTranslation(translations: { locale: string }[] | undefined): void {
  if (!translations?.some((t) => t.locale === DEFAULT_LOCALE)) {
    throw new BadRequestException(`A translation for the default locale (${DEFAULT_LOCALE}) is required`);
  }
}

/** Mínimo ≤ máximo em faixas opcionais (temperatura, pH, dureza, volume). */
export function assertRange(label: string, min?: number | null, max?: number | null): void {
  if (min != null && max != null && min > max) {
    throw new BadRequestException(`${label}: minimum (${min}) must not be greater than maximum (${max})`);
  }
}
