import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AquarismoSizingUnit, Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantContext } from '../../tenant/tenant.context';
import { assertRange, requireDefaultTranslation, slugify, visibilityWhere } from '../common/catalog.utils';
import { pickTranslation } from '../common/locale';
import { CreateEquipmentDto, EquipmentQueryDto, EquipmentTranslationDto, UpdateEquipmentDto } from './dto/equipment.dto';

type EquipmentWithTranslations = Prisma.AquarismoEquipmentGetPayload<{ include: { translations: true } }>;

/**
 * Faixa recomendada para um volume, a partir da regra de dimensionamento
 * (ex.: aquecedor 0,5–1 W/L em 100 L → 50–100 W; filtro 5–10×/h em 100 L → 500–1000 L/h).
 */
export function recommendedFor(
  e: { sizingUnit: AquarismoSizingUnit; sizingMin: number | null; sizingMax: number | null },
  volumeL: number,
) {
  if (e.sizingUnit === AquarismoSizingUnit.NONE || e.sizingMin == null) return null;
  const max = e.sizingMax ?? e.sizingMin;
  const unit = e.sizingUnit === AquarismoSizingUnit.WATTS_PER_LITER ? 'W' : 'L/h';
  return { volumeL, min: Math.round(e.sizingMin * volumeL), max: Math.round(max * volumeL), unit };
}

@Injectable()
export class EquipmentService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: EquipmentQueryDto, locale: string, canSeeUnpublished = false) {
    const blogId = TenantContext.getTenantId();
    const and: Prisma.AquarismoEquipmentWhereInput[] = [{ blogId }, visibilityWhere(canSeeUnpublished)];
    if (query.type) and.push({ type: query.type });
    if (query.waterType) and.push({ waterTypes: { has: query.waterType } });
    if (query.techLevel) and.push({ techLevel: query.techLevel });
    if (query.volume != null) {
      and.push({ OR: [{ minVolumeL: null }, { minVolumeL: { lte: query.volume } }] });
      and.push({ OR: [{ maxVolumeL: null }, { maxVolumeL: { gte: query.volume } }] });
    }
    const items = await this.prisma.aquarismoEquipment.findMany({
      where: { AND: and },
      include: { translations: true },
      orderBy: [{ type: 'asc' }, { slug: 'asc' }],
    });
    return items.map((e) => this.toView(e, locale, query.volume));
  }

  async findBySlug(slug: string, locale: string, canSeeUnpublished = false, volume?: number) {
    return this.toView(await this.getOne({ slug }, canSeeUnpublished), locale, volume);
  }

  async create(dto: CreateEquipmentDto, locale: string) {
    const blogId = TenantContext.getTenantId();
    requireDefaultTranslation(dto.translations);
    this.validateRanges(dto);
    const slug = slugify(dto.slug);
    await this.ensureUnique(slug);
    const { translations, ...fields } = dto;
    const created = await this.prisma.aquarismoEquipment.create({
      data: { ...fields, blogId, slug, translations: { create: translations.map((t) => this.translationData(t)) } },
      include: { translations: true },
    });
    return this.toView(created, locale);
  }

  async update(id: string, dto: UpdateEquipmentDto, locale: string) {
    const current = await this.getOne({ id }, true);
    this.validateRanges({ ...current, ...dto });
    const slug = dto.slug ? slugify(dto.slug) : undefined;
    if (slug) await this.ensureUnique(slug, id);
    const { translations, ...fields } = dto;
    const updated = await this.prisma.$transaction(async (tx) => {
      for (const t of translations ?? []) {
        await tx.aquarismoEquipmentTranslation.upsert({
          where: { equipmentId_locale: { equipmentId: id, locale: t.locale } },
          create: { equipmentId: id, ...this.translationData(t) },
          update: this.translationData(t),
        });
      }
      return tx.aquarismoEquipment.update({ where: { id }, data: { ...fields, ...(slug && { slug }) }, include: { translations: true } });
    });
    return this.toView(updated, locale);
  }

  async updateStatus(id: string, status: Status) {
    await this.getOne({ id }, true);
    await this.prisma.aquarismoEquipment.update({ where: { id }, data: { status } });
  }

  private async getOne(where: { id?: string; slug?: string }, canSeeUnpublished: boolean) {
    const blogId = TenantContext.getTenantId();
    const item = await this.prisma.aquarismoEquipment.findFirst({
      where: { ...where, blogId, ...visibilityWhere(canSeeUnpublished) },
      include: { translations: true },
    });
    if (!item) throw new NotFoundException(`Equipment not found: ${where.slug ?? where.id}`);
    return item;
  }

  private async ensureUnique(slug: string, exceptId?: string) {
    const blogId = TenantContext.getTenantId();
    const conflict = await this.prisma.aquarismoEquipment.findFirst({ where: { blogId, slug, ...(exceptId ? { NOT: { id: exceptId } } : {}) } });
    if (conflict) throw new ConflictException(`Equipment already exists: ${slug}`);
  }

  private validateRanges(d: { minVolumeL?: number | null; maxVolumeL?: number | null; sizingMin?: number | null; sizingMax?: number | null }) {
    assertRange('volume', d.minVolumeL, d.maxVolumeL);
    assertRange('sizing', d.sizingMin, d.sizingMax);
  }

  private translationData(t: EquipmentTranslationDto) {
    return { locale: t.locale, name: t.name, description: t.description, sizingNote: t.sizingNote ?? null };
  }

  private toView(e: EquipmentWithTranslations, locale: string, volume?: number) {
    const { translations, blogId: _blogId, ...fields } = e;
    const t = pickTranslation(translations, locale);
    return {
      ...fields,
      locale: t?.locale ?? locale,
      name: t?.name ?? e.slug,
      description: t?.description ?? '',
      sizingNote: t?.sizingNote ?? null,
      recommended: volume != null ? recommendedFor(e, volume) : null,
    };
  }
}
