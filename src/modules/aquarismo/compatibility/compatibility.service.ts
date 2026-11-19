import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantContext } from '../../tenant/tenant.context';
import { pickTranslation } from '../common/locale';
import { SpeciesService } from '../species/species.service';
import { CompatibilityLevel, CompatibilityResult, evaluateCompatibility, FishSex, worstLevel } from './compatibility.rule';
import { UpsertCompatibilityOverrideDto } from './dto/compatibility.dto';

/** Par guardado sempre na mesma ordem (menor id primeiro). */
const orderPair = (x: string, y: string): [string, string] => (x < y ? [x, y] : [y, x]);

const SEX_LABEL: Record<string, Record<FishSex, string>> = {
  'pt-BR': { male: 'macho', female: 'fêmea' },
  en: { male: 'male', female: 'female' },
};

/** Entrada da checagem: "slug" ou "slug:male" / "slug:female". */
interface Entry {
  key: string;
  slug: string;
  sex?: FishSex;
}

function parseEntry(raw: string): Entry {
  const [slug, sex] = raw.split(':');
  return { key: raw, slug, sex: sex === 'male' || sex === 'female' ? sex : undefined };
}

@Injectable()
export class CompatibilityService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly species: SpeciesService,
  ) {}

  /**
   * Avalia um grupo: todos os pares de entradas diferentes (espécies ou sexos diferentes) e, quando uma
   * entrada aparece repetida (mais de um indivíduo), o par dela consigo mesma (ex.: duas fêmeas de Betta).
   * Sem sexo informado, a regra assume macho.
   */
  async check(rawEntries: string[], locale: string, canSeeUnpublished = false) {
    const entries = [...new Map(rawEntries.map((r) => [r, parseEntry(r)])).values()];
    const repeated = new Set(rawEntries.filter((r, i) => rawEntries.indexOf(r) !== i));
    if (entries.length < 2 && repeated.size === 0) {
      throw new BadRequestException('Provide at least two species, or repeat one to check individuals of the same species');
    }

    const list = await this.species.findManyBySlugs([...new Set(entries.map((e) => e.slug))], canSeeUnpublished);
    const bySlug = new Map(list.map((s) => [s.slug, s]));
    const names = Object.fromEntries(list.map((s) => [s.id, pickTranslation(s.translations, locale)?.commonName ?? s.scientificName]));
    const sexLabels = SEX_LABEL[locale] ?? SEX_LABEL['pt-BR'];
    const label = (e: Entry) => {
      const name = names[bySlug.get(e.slug)!.id];
      return e.sex ? `${name} (${sexLabels[e.sex]})` : name;
    };
    const overrides = await this.loadOverrides(list.map((s) => s.id), locale);

    const pairs: { a: string; b: string; level: CompatibilityLevel; reasons: CompatibilityResult['reasons'] }[] = [];
    for (let i = 0; i < entries.length; i++) {
      for (let j = i; j < entries.length; j++) {
        const [ea, eb] = [entries[i], entries[j]];
        if (i === j && !repeated.has(ea.key)) continue;
        const [a, b] = [bySlug.get(ea.slug)!, bySlug.get(eb.slug)!];
        const override = a.id === b.id ? null : (overrides.get(orderPair(a.id, b.id).join(':')) ?? null);
        const result = evaluateCompatibility(a, b, {
          locale,
          names,
          override,
          sexA: ea.sex,
          sexB: eb.sex,
          labelA: label(ea),
          labelB: label(eb),
        });
        pairs.push({ a: ea.key, b: eb.key, ...result });
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
