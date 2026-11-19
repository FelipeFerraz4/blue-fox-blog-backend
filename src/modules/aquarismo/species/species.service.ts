import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantContext } from '../../tenant/tenant.context';
import { assertRange, requireDefaultTranslation, slugify, visibilityWhere } from '../common/catalog.utils';
import { CreateSpeciesDto, SpeciesQueryDto, SpeciesTranslationDto, UpdateSpeciesDto } from './dto/species.dto';
import { SPECIES_INCLUDE, SpeciesWithRelations, toSpeciesView } from './species.mapper';

@Injectable()
export class SpeciesService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lista com filtros (todos opcionais e combináveis). */
  async findAll(query: SpeciesQueryDto, locale: string, canSeeUnpublished = false) {
    const blogId = TenantContext.getTenantId();
    const and: Prisma.AquarismoSpeciesWhereInput[] = [{ blogId }, visibilityWhere(canSeeUnpublished)];

    if (query.waterType) and.push({ waterType: query.waterType });
    if (query.temperature != null) and.push({ tempMinC: { lte: query.temperature }, tempMaxC: { gte: query.temperature } });
    if (query.ph != null) and.push({ phMin: { lte: query.ph }, phMax: { gte: query.ph } });
    if (query.volume != null) and.push({ minVolumeL: { lte: query.volume } });
    if (query.tankLength != null) and.push({ minTankLengthCm: { lte: query.tankLength } });
    if (query.temperament) and.push({ temperament: query.temperament });
    if (query.difficulty) and.push({ difficulty: query.difficulty });
    if (query.layer) and.push({ layers: { has: query.layer } });
    if (query.noFinNippers) and.push({ finNipper: false });
    if (query.family) and.push({ family: { slug: query.family } });
    if (query.biome) and.push({ biomes: { some: { biome: { slug: query.biome } } } });
    if (query.q?.trim()) {
      const q = query.q.trim();
      and.push({
        OR: [
          { scientificName: { contains: q, mode: 'insensitive' } },
          { translations: { some: { commonName: { contains: q, mode: 'insensitive' } } } },
          { translations: { some: { otherNames: { has: q } } } },
        ],
      });
    }

    const species = await this.prisma.aquarismoSpecies.findMany({
      where: { AND: and },
      include: SPECIES_INCLUDE,
      orderBy: { scientificName: 'asc' },
    });
    return species.map((s) => toSpeciesView(s, locale, canSeeUnpublished));
  }

  async findBySlug(slug: string, locale: string, canSeeUnpublished = false) {
    return toSpeciesView(await this.getOne({ slug }, canSeeUnpublished), locale, canSeeUnpublished);
  }

  async findById(id: string, locale: string, canSeeUnpublished = false) {
    return toSpeciesView(await this.getOne({ id }, canSeeUnpublished), locale, canSeeUnpublished);
  }

  /** Espécies por slug, para a checagem de compatibilidade (mantém a ordem pedida; 404 se faltar alguma). */
  async findManyBySlugs(slugs: string[], canSeeUnpublished = false): Promise<SpeciesWithRelations[]> {
    const blogId = TenantContext.getTenantId();
    const found = await this.prisma.aquarismoSpecies.findMany({
      where: { blogId, slug: { in: slugs }, ...visibilityWhere(canSeeUnpublished) },
      include: SPECIES_INCLUDE,
    });
    const missing = slugs.filter((s) => !found.some((f) => f.slug === s));
    if (missing.length) throw new NotFoundException(`Species not found: ${missing.join(', ')}`);
    return slugs.map((s) => found.find((f) => f.slug === s)!);
  }

  async create(dto: CreateSpeciesDto, locale: string) {
    const blogId = TenantContext.getTenantId();
    requireDefaultTranslation(dto.translations);
    this.validateRanges(dto);
    const slug = slugify(dto.slug ?? dto.scientificName);
    await this.ensureUnique(slug, dto.scientificName);
    await this.ensureRelations(dto.familyId, dto.biomeIds);

    const { translations, biomeIds, lastReviewedAt, ...fields } = dto;
    const created = await this.prisma.aquarismoSpecies.create({
      data: {
        ...fields,
        blogId,
        slug,
        lastReviewedAt: lastReviewedAt ? new Date(lastReviewedAt) : undefined,
        translations: { create: translations.map((t) => this.translationData(t)) },
        biomes: biomeIds?.length ? { create: biomeIds.map((biomeId) => ({ biomeId })) } : undefined,
      },
      include: SPECIES_INCLUDE,
    });
    return toSpeciesView(created, locale, true);
  }

  async update(id: string, dto: UpdateSpeciesDto, locale: string) {
    const current = await this.getOne({ id }, true);
    this.validateRanges({ ...current, ...dto });
    const slug = dto.slug ? slugify(dto.slug) : undefined;
    if (slug || dto.scientificName) await this.ensureUnique(slug ?? current.slug, dto.scientificName ?? current.scientificName, id);
    await this.ensureRelations(dto.familyId, dto.biomeIds);

    const { translations, biomeIds, lastReviewedAt, ...fields } = dto;
    const updated = await this.prisma.$transaction(async (tx) => {
      for (const t of translations ?? []) {
        await tx.aquarismoSpeciesTranslation.upsert({
          where: { speciesId_locale: { speciesId: id, locale: t.locale } },
          create: { speciesId: id, ...this.translationData(t) },
          update: this.translationData(t),
        });
      }
      if (biomeIds) {
        await tx.aquarismoSpeciesBiome.deleteMany({ where: { speciesId: id } });
        if (biomeIds.length) await tx.aquarismoSpeciesBiome.createMany({ data: biomeIds.map((biomeId) => ({ speciesId: id, biomeId })) });
      }
      return tx.aquarismoSpecies.update({
        where: { id },
        data: {
          ...fields,
          ...(slug && { slug }),
          ...(lastReviewedAt && { lastReviewedAt: new Date(lastReviewedAt) }),
        },
        include: SPECIES_INCLUDE,
      });
    });
    return toSpeciesView(updated, locale, true);
  }

  async updateStatus(id: string, status: Status) {
    await this.getOne({ id }, true);
    await this.prisma.aquarismoSpecies.update({ where: { id }, data: { status } });
  }

  async softDelete(id: string) {
    await this.updateStatus(id, Status.DELETED);
  }

  async hardDelete(id: string) {
    await this.getOne({ id }, true, true);
    await this.prisma.aquarismoSpecies.delete({ where: { id } });
  }

  private async getOne(where: { id?: string; slug?: string }, canSeeUnpublished: boolean, includeDeleted = false) {
    const blogId = TenantContext.getTenantId();
    const species = await this.prisma.aquarismoSpecies.findFirst({
      where: { ...where, blogId, ...(includeDeleted ? {} : visibilityWhere(canSeeUnpublished)) },
      include: SPECIES_INCLUDE,
    });
    if (!species) throw new NotFoundException(`Species not found: ${where.slug ?? where.id}`);
    return species;
  }

  private translationData(t: SpeciesTranslationDto) {
    return {
      locale: t.locale,
      commonName: t.commonName,
      otherNames: t.otherNames ?? [],
      region: t.region ?? null,
      description: t.description,
      careNotes: t.careNotes ?? null,
    };
  }

  private validateRanges(d: { tempMinC?: number; tempMaxC?: number; phMin?: number; phMax?: number; ghMin?: number | null; ghMax?: number | null }) {
    assertRange('temperature', d.tempMinC, d.tempMaxC);
    assertRange('pH', d.phMin, d.phMax);
    assertRange('GH', d.ghMin, d.ghMax);
  }

  private async ensureUnique(slug: string, scientificName: string, exceptId?: string) {
    const blogId = TenantContext.getTenantId();
    const conflict = await this.prisma.aquarismoSpecies.findFirst({
      where: { blogId, OR: [{ slug }, { scientificName }], ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    });
    if (conflict) throw new ConflictException(`Species already exists: ${conflict.slug}`);
  }

  /** Família e biomas precisam existir no mesmo blog. */
  private async ensureRelations(familyId?: string, biomeIds?: string[]) {
    const blogId = TenantContext.getTenantId();
    if (familyId && !(await this.prisma.aquarismoFamily.findFirst({ where: { id: familyId, blogId } }))) {
      throw new BadRequestException(`Family not found: ${familyId}`);
    }
    if (biomeIds?.length) {
      const count = await this.prisma.aquarismoBiome.count({ where: { id: { in: biomeIds }, blogId } });
      if (count !== biomeIds.length) throw new BadRequestException('One or more biomes were not found');
    }
  }
}
