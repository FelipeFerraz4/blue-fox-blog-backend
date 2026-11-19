import { Prisma } from '@prisma/client';
import { isVisible } from '../common/catalog.utils';
import { pickTranslation } from '../common/locale';

/** Relações carregadas em toda leitura de espécie. */
export const SPECIES_INCLUDE = {
  translations: true,
  family: { include: { translations: true } },
  biomes: { include: { biome: { include: { translations: true } } } },
} satisfies Prisma.AquarismoSpeciesInclude;

export type SpeciesWithRelations = Prisma.AquarismoSpeciesGetPayload<{ include: typeof SPECIES_INCLUDE }>;

/**
 * Achata a espécie para a resposta da API: textos no idioma pedido (com fallback), família e biomas
 * resumidos. Biomas que o visitante não pode ver (rascunho/inativo) ficam de fora.
 */
export function toSpeciesView(species: SpeciesWithRelations, locale: string, canSeeUnpublished: boolean) {
  const { translations, family, biomes, blogId: _blogId, ...fields } = species;
  const t = pickTranslation(translations, locale);
  const familyT = family ? pickTranslation(family.translations, locale) : null;
  return {
    ...fields,
    locale: t?.locale ?? locale,
    commonName: t?.commonName ?? species.scientificName,
    otherNames: t?.otherNames ?? [],
    region: t?.region ?? null,
    description: t?.description ?? '',
    careNotes: t?.careNotes ?? null,
    family: family
      ? { id: family.id, slug: family.slug, scientificName: family.scientificName, name: familyT?.name ?? family.scientificName }
      : null,
    biomes: biomes
      .map((b) => b.biome)
      .filter((b) => isVisible(b, canSeeUnpublished))
      .map((b) => ({ id: b.id, slug: b.slug, name: pickTranslation(b.translations, locale)?.name ?? b.slug })),
  };
}

export type SpeciesView = ReturnType<typeof toSpeciesView>;
