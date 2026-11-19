import { Injectable } from '@nestjs/common';
import { AquarismoPublication, ReportStatus, Status } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';

/** Ficha sem revisão há mais que isto entra na lista "precisa revisar". */
export const STALE_REVIEW_MONTHS = 6;

/**
 * Números do painel admin, sempre do blog atual. Só leitura, agregada direto no banco
 * (posts, catálogo do Aquarismo e relatos), para não acoplar os módulos entre si.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async stats(now = new Date()) {
    const blogId = TenantContext.getTenantId();
    const notDeleted = { not: Status.DELETED };
    const staleBefore = new Date(now);
    staleBefore.setMonth(staleBefore.getMonth() - STALE_REVIEW_MONTHS);

    const [categories, postsByCategory, topPosts, speciesByPublication, families, biomes, reportsByStatus, latestReports, staleSpecies] =
      await Promise.all([
        this.prisma.category.findMany({ where: { blogId, status: notDeleted }, select: { id: true, name: true, slug: true } }),
        this.prisma.post.groupBy({ by: ['categoryId', 'published'], where: { blogId, status: notDeleted }, _count: { _all: true } }),
        this.prisma.post.findMany({
          where: { blogId, published: true, status: Status.ACTIVE },
          orderBy: { views: 'desc' },
          take: 5,
          select: { id: true, title: true, slug: true, views: true },
        }),
        this.prisma.aquarismoSpecies.groupBy({ by: ['publication'], where: { blogId, status: notDeleted }, _count: { _all: true } }),
        this.prisma.aquarismoFamily.findMany({
          where: { blogId, status: notDeleted },
          select: {
            slug: true,
            scientificName: true,
            translations: { where: { locale: 'pt-BR' }, select: { name: true } },
            _count: { select: { species: { where: { status: notDeleted } } } },
          },
          orderBy: { scientificName: 'asc' },
        }),
        this.prisma.aquarismoBiome.findMany({
          where: { blogId, status: notDeleted },
          select: {
            slug: true,
            translations: { where: { locale: 'pt-BR' }, select: { name: true } },
            _count: { select: { species: { where: { species: { status: notDeleted } } } } },
          },
          orderBy: { slug: 'asc' },
        }),
        this.prisma.report.groupBy({ by: ['status'], where: { blogId }, _count: { _all: true } }),
        this.prisma.report.findMany({
          where: { blogId },
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: { id: true, targetType: true, targetSlug: true, targetTitle: true, message: true, status: true, createdAt: true },
        }),
        this.prisma.aquarismoSpecies.findMany({
          where: { blogId, status: notDeleted, OR: [{ lastReviewedAt: null }, { lastReviewedAt: { lt: staleBefore } }] },
          orderBy: { lastReviewedAt: { sort: 'asc', nulls: 'first' } },
          select: {
            id: true,
            slug: true,
            scientificName: true,
            lastReviewedAt: true,
            translations: { where: { locale: 'pt-BR' }, select: { commonName: true } },
          },
        }),
      ]);

    const speciesCount = zeroes(Object.values(AquarismoPublication));
    for (const r of speciesByPublication) speciesCount[r.publication] = r._count._all;
    const reportCount = zeroes(Object.values(ReportStatus));
    for (const r of reportsByStatus) reportCount[r.status] = r._count._all;

    const posts = categories.map((c) => {
      const rows = postsByCategory.filter((r) => r.categoryId === c.id);
      const published = rows.filter((r) => r.published).reduce((n, r) => n + r._count._all, 0);
      const drafts = rows.filter((r) => !r.published).reduce((n, r) => n + r._count._all, 0);
      return { categoryId: c.id, category: c.name, slug: c.slug, published, drafts };
    });

    return {
      generatedAt: now.toISOString(),
      posts: {
        total: posts.reduce((n, p) => n + p.published + p.drafts, 0),
        published: posts.reduce((n, p) => n + p.published, 0),
        drafts: posts.reduce((n, p) => n + p.drafts, 0),
        byCategory: posts,
        mostRead: topPosts.map((p) => ({ ...p, views: Number(p.views) })),
      },
      species: {
        byPublication: speciesCount,
        byFamily: families.map((f) => ({ slug: f.slug, name: f.translations[0]?.name ?? f.scientificName, count: f._count.species })),
        byBiome: biomes.map((b) => ({ slug: b.slug, name: b.translations[0]?.name ?? b.slug, count: b._count.species })),
        staleReviewMonths: STALE_REVIEW_MONTHS,
        needsReview: staleSpecies.map((s) => ({
          id: s.id,
          slug: s.slug,
          name: s.translations[0]?.commonName ?? s.scientificName,
          lastReviewedAt: s.lastReviewedAt,
        })),
      },
      reports: {
        byStatus: reportCount,
        pending: reportCount.NEW + reportCount.IN_REVIEW,
        latest: latestReports,
      },
    };
  }
}

/** Objeto { chave: 0 } para cada valor do enum (os que não aparecem no groupBy ficam zerados). */
function zeroes<K extends string>(keys: K[]): Record<K, number> {
  return Object.fromEntries(keys.map((k) => [k, 0])) as Record<K, number>;
}
