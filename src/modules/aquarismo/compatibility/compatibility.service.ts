import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantContext } from '../../tenant/tenant.context';
import { pickTranslation } from '../common/locale';
import { SpeciesService } from '../species/species.service';
import { CompatibilityLevel, CompatibilityResult, evaluateCompatibility, worstLevel } from './compatibility.rule';
import { UpsertCompatibilityOverrideDto } from './dto/compatibility.dto';

/** Par guardado sempre na mesma ordem (menor id primeiro). */
const orderPair = (x: string, y: string): [string, string] => (x < y ? [x, y] : [y, x]);

@Injectable()
export class CompatibilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly species: SpeciesService,
  ) {}

  /**
   * Avalia um grupo de espécies: todos os pares de espécies diferentes e, quando um slug aparece
   * repetido (mais de um indivíduo), o par da espécie consigo mesma (ex.: dois machos de Betta).
   */
  async check(slugs: string[], locale: string, canSeeUnpublished = false) {
    const distinct = [...new Set(slugs)];
    const repeated = new Set(slugs.filter((s, i) => slugs.indexOf(s) !== i));
    if (distinct.length < 2 && repeated.size === 0) {
      throw new BadRequestException('Provide at least two species, or repeat a slug to check individuals of the same species');
    }

    const list = await this.species.findManyBySlugs(distinct, canSeeUnpublished);
    const names = Object.fromEntries(list.map((s) => [s.id, pickTranslation(s.translations, locale)?.commonName ?? s.scientificName]));
    const overrides = await this.loadOverrides(list.map((s) => s.id), locale);

    const pairs: { a: string; b: string; level: CompatibilityLevel; reasons: CompatibilityResult['reasons'] }[] = [];
    for (let i = 0; i < list.length; i++) {
      for (let j = i; j < list.length; j++) {
        const [a, b] = [list[i], list[j]];
        if (i === j && !repeated.has(a.slug)) continue;
        const override = overrides.get(orderPair(a.id, b.id).join(':')) ?? null;
        const result = evaluateCompatibility(a, b, { locale, names, override });
        pairs.push({ a: a.slug, b: b.slug, ...result });
      }
    }

    return {
      locale,
      level: worstLevel(pairs.map((p) => p.level)),
      species: list.map((s) => ({ id: s.id, slug: s.slug, scientificName: s.scientificName, commonName: names[s.id] })),
      pairs,
    };
  }

  async upsertOverride(dto: UpsertCompatibilityOverrideDto) {
    const blogId = TenantContext.getTenantId();
    const [speciesAId, speciesBId] = orderPair(dto.speciesAId, dto.speciesBId);
    const count = await this.prisma.aquarismoSpecies.count({ where: { blogId, id: { in: [speciesAId, speciesBId] } } });
    if (count !== new Set([speciesAId, speciesBId]).size) throw new NotFoundException('One or both species were not found');

    return this.prisma.$transaction(async (tx) => {
      const saved = await tx.aquarismoSpeciesCompatibility.upsert({
        where: { speciesAId_speciesBId: { speciesAId, speciesBId } },
        create: { blogId, speciesAId, speciesBId, override: dto.override },
        update: { override: dto.override },
      });
      for (const n of dto.notes ?? []) {
        await tx.aquarismoSpeciesCompatibilityTranslation.upsert({
          where: { compatibilityId_locale: { compatibilityId: saved.id, locale: n.locale } },
          create: { compatibilityId: saved.id, locale: n.locale, note: n.note },
          update: { note: n.note },
        });
      }
      return tx.aquarismoSpeciesCompatibility.findUnique({ where: { id: saved.id }, include: { translations: true } });
    });
  }

  async removeOverride(id: string) {
    const blogId = TenantContext.getTenantId();
    const found = await this.prisma.aquarismoSpeciesCompatibility.findFirst({ where: { id, blogId } });
    if (!found) throw new NotFoundException(`Compatibility override not found: ${id}`);
    await this.prisma.aquarismoSpeciesCompatibility.delete({ where: { id } });
  }

  private async loadOverrides(ids: string[], locale: string) {
    const blogId = TenantContext.getTenantId();
    const rows = await this.prisma.aquarismoSpeciesCompatibility.findMany({
      where: { blogId, speciesAId: { in: ids }, speciesBId: { in: ids } },
      include: { translations: true },
    });
    return new Map(
      rows.map((r) => [`${r.speciesAId}:${r.speciesBId}`, { override: r.override, note: pickTranslation(r.translations, locale)?.note ?? null }]),
    );
  }
}
