import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { AquarismoPublication, Prisma, Status } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { TenantContext } from '../../tenant/tenant.context';
import { requireDefaultTranslation, slugify } from '../common/catalog.utils';
import { pickTranslation } from '../common/locale';
import { CreateFamilyDto, UpdateFamilyDto } from './dto/family.dto';

type FamilyWithTranslations = Prisma.AquarismoFamilyGetPayload<{ include: { translations: true } }>;

/** Famílias não têm rascunho: o público vê as ACTIVE; editores também as inativas. */
@Injectable()
export class FamiliesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(locale: string, canSeeInactive = false) {
    const blogId = TenantContext.getTenantId();
    const families = await this.prisma.aquarismoFamily.findMany({
      where: { blogId, ...(canSeeInactive ? { status: { not: Status.DELETED } } : { status: Status.ACTIVE }) },
      include: {
        translations: true,
        _count: { select: { species: { where: canSeeInactive ? {} : { status: Status.ACTIVE, publication: AquarismoPublication.PUBLISHED } } } },
      },
      orderBy: { scientificName: 'asc' },
    });
    return families.map(({ _count, ...f }) => ({ ...this.toView(f, locale), speciesCount: _count.species }));
  }

  async findBySlug(slug: string, locale: string, canSeeInactive = false) {
    return this.toView(await this.getOne({ slug }, canSeeInactive), locale);
  }

  async create(dto: CreateFamilyDto, locale: string) {
    const blogId = TenantContext.getTenantId();
    requireDefaultTranslation(dto.translations);
    const slug = slugify(dto.slug ?? dto.scientificName);
    await this.ensureUnique(slug, dto.scientificName);
    const created = await this.prisma.aquarismoFamily.create({
      data: {
        blogId,
        slug,
        scientificName: dto.scientificName,
        translations: { create: dto.translations.map((t) => ({ locale: t.locale, name: t.name, description: t.description ?? null })) },
      },
      include: { translations: true },
    });
    return this.toView(created, locale);
  }

  async update(id: string, dto: UpdateFamilyDto, locale: string) {
    const current = await this.getOne({ id }, true);
    const slug = dto.slug ? slugify(dto.slug) : undefined;
    if (slug || dto.scientificName) await this.ensureUnique(slug ?? current.slug, dto.scientificName ?? current.scientificName, id);
    const updated = await this.prisma.$transaction(async (tx) => {
      for (const t of dto.translations ?? []) {
        const data = { name: t.name, description: t.description ?? null };
        await tx.aquarismoFamilyTranslation.upsert({
          where: { familyId_locale: { familyId: id, locale: t.locale } },
          create: { familyId: id, locale: t.locale, ...data },
          update: data,
        });
      }
      return tx.aquarismoFamily.update({
        where: { id },
        data: { ...(slug && { slug }), ...(dto.scientificName && { scientificName: dto.scientificName }) },
        include: { translations: true },
      });
    });
    return this.toView(updated, locale);
  }

  async updateStatus(id: string, status: Status) {
    await this.getOne({ id }, true);
    await this.prisma.aquarismoFamily.update({ where: { id }, data: { status } });
  }

  private async getOne(where: { id?: string; slug?: string }, canSeeInactive: boolean) {
    const blogId = TenantContext.getTenantId();
    const family = await this.prisma.aquarismoFamily.findFirst({
      where: { ...where, blogId, ...(canSeeInactive ? { status: { not: Status.DELETED } } : { status: Status.ACTIVE }) },
      include: { translations: true },
    });
    if (!family) throw new NotFoundException(`Family not found: ${where.slug ?? where.id}`);
    return family;
  }

  private async ensureUnique(slug: string, scientificName: string, exceptId?: string) {
    const blogId = TenantContext.getTenantId();
    const conflict = await this.prisma.aquarismoFamily.findFirst({
      where: { blogId, OR: [{ slug }, { scientificName }], ...(exceptId ? { NOT: { id: exceptId } } : {}) },
    });
    if (conflict) throw new ConflictException(`Family already exists: ${conflict.slug}`);
  }

  private toView(family: FamilyWithTranslations, locale: string) {
    const { translations, blogId: _blogId, ...fields } = family;
    const t = pickTranslation(translations, locale);
    return { ...fields, locale: t?.locale ?? locale, name: t?.name ?? family.scientificName, description: t?.description ?? null };
  }
}
