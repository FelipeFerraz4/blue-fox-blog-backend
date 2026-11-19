import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantContext } from '../../tenant/tenant.context';
import { assertRange, isVisible, requireDefaultTranslation, slugify, visibilityWhere } from '../common/catalog.utils';
import { pickTranslation } from '../common/locale';
import { BiomeQueryDto, BiomeTranslationDto, CreateBiomeDto, UpdateBiomeDto } from './dto/biome.dto';

const BIOME_INCLUDE = {
  translations: true,
  species: { include: { species: { include: { translations: true } } } },
} satisfies Prisma.AquarismoBiomeInclude;

type BiomeWithRelations = Prisma.AquarismoBiomeGetPayload<{ include: typeof BIOME_INCLUDE }>;

@Injectable()
export class BiomesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: BiomeQueryDto, locale: string, canSeeUnpublished = false) {
    const blogId = TenantContext.getTenantId();
    const biomes = await this.prisma.aquarismoBiome.findMany({
      where: {
        blogId,
        ...visibilityWhere(canSeeUnpublished),
        ...(query.waterType && { waterType: query.waterType }),
        ...(query.techLevel && { techLevel: query.techLevel }),
      },
      include: BIOME_INCLUDE,
      orderBy: { slug: 'asc' },
    });
    return biomes.map((b) => this.toView(b, locale, canSeeUnpublished));
  }

  async findBySlug(slug: string, locale: string, canSeeUnpublished = false) {
    return this.toView(await this.getOne({ slug }, canSeeUnpublished), locale, canSeeUnpublished);
  }

  async create(dto: CreateBiomeDto, locale: string) {
    const blogId = TenantContext.getTenantId();
    requireDefaultTranslation(dto.translations);
    this.validateRanges(dto);
    const slug = slugify(dto.slug);
    await this.ensureUnique(slug);
    const { translations, ...fields } = dto;
    const created = await this.prisma.aquarismoBiome.create({
      data: { ...fields, blogId, slug, translations: { create: translations.map((t) => this.translationData(t)) } },
      include: BIOME_INCLUDE,
    });
    return this.toView(created, locale, true);
  }

  async update(id: string, dto: UpdateBiomeDto, locale: string) {
    const current = await this.getOne({ id }, true);
    this.validateRanges({ ...current, ...dto });
    const slug = dto.slug ? slugify(dto.slug) : undefined;
    if (slug) await this.ensureUnique(slug, id);
    const { translations, ...fields } = dto;
    const updated = await this.prisma.$transaction(async (tx) => {
      for (const t of translations ?? []) {
        await tx.aquarismoBiomeTranslation.upsert({
          where: { biomeId_locale: { biomeId: id, locale: t.locale } },
          create: { biomeId: id, ...this.translationData(t) },
          update: this.translationData(t),
        });
      }
      return tx.aquarismoBiome.update({ where: { id }, data: { ...fields, ...(slug && { slug }) }, include: BIOME_INCLUDE });
    });
    return this.toView(updated, locale, true);
  }

  async updateStatus(id: string, status: Status) {
    await this.getOne({ id }, true);
    await this.prisma.aquarismoBiome.update({ where: { id }, data: { status } });
  }

  private async getOne(where: { id?: string; slug?: string }, canSeeUnpublished: boolean) {
    const blogId = TenantContext.getTenantId();
    const biome = await this.prisma.aquarismoBiome.findFirst({
      where: { ...where, blogId, ...visibilityWhere(canSeeUnpublished) },
      include: BIOME_INCLUDE,
    });
    if (!biome) throw new NotFoundException(`Biome not found: ${where.slug ?? where.id}`);
    return biome;
  }

  private async ensureUnique(slug: string, exceptId?: string) {
    const blogId = TenantContext.getTenantId();
    const conflict = await this.prisma.aquarismoBiome.findFirst({ where: { blogId, slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) } });
    if (conflict) throw new ConflictException(`Biome already exists: ${slug}`);
  }

  private validateRanges(d: { tempMinC?: number; tempMaxC?: number; phMin?: number; phMax?: number; ghMin?: number | null; ghMax?: number | null }) {
    assertRange('temperature', d.tempMinC, d.tempMaxC);
    assertRange('pH', d.phMin, d.phMax);
    assertRange('GH', d.ghMin, d.ghMax);
  }

  private translationData(t: BiomeTranslationDto) {
    return {
      locale: t.locale,
      name: t.name,
      region: t.region ?? null,
      description: t.description,
      substrate: t.substrate ?? null,
      hardscape: t.hardscape ?? null,
      plants: t.plants ?? null,
    };
  }

  /** Biomas listam as espécies associadas que o visitante pode ver. */
  private toView(biome: BiomeWithRelations, locale: string, canSeeUnpublished: boolean) {
    const { translations, species, blogId: _blogId, ...fields } = biome;
    const t = pickTranslation(translations, locale);
    return {
      ...fields,
      locale: t?.locale ?? locale,
      name: t?.name ?? biome.slug,
      region: t?.region ?? null,
      description: t?.description ?? '',
      substrate: t?.substrate ?? null,
      hardscape: t?.hardscape ?? null,
      plants: t?.plants ?? null,
      species: species
        .map((s) => s.species)
        .filter((s) => isVisible(s, canSeeUnpublished))
        .map((s) => ({
          id: s.id,
          slug: s.slug,
          scientificName: s.scientificName,
          commonName: pickTranslation(s.translations, locale)?.commonName ?? s.scientificName,
        })),
    };
  }
}
