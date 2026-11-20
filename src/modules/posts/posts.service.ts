import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Prisma, Status } from '@prisma/client';
import { DEFAULT_LOCALE } from '../../common/i18n/locale';
import { PostTranslationDto } from './dto/post-translation.dto';

const WEIGHT_VIEWS = 0.5;
const WEIGHT_LIKES = 2.0;
const WEIGHT_COMMENTS = 3.0;
const DECAY_DAYS_PENALTY = 0.1;

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\w\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private postInclude = {
    category: { include: { translations: true } },
    author: true,
    translations: true,
    recommendationsPost: {
      include: {
        recommendedPost: {
          include: {
            category: true,
            author: true,
          },
        },
      },
    },
    _count: {
      select: { comments: true },
    },
  };

  /**
   * Resposta do post no idioma pedido: título, descrição e nome da categoria vêm da tradução quando
   * existe (senão, do registro principal, em pt-BR). `locale` diz o idioma servido; `translations`
   * traz as traduções cadastradas (para o painel editar).
   */
  private mapPost(post: any, locale: string = DEFAULT_LOCALE) {
    if (!post) return null;
    const recommendedPostIds = post.recommendationsPost
      ? post.recommendationsPost.map((r: any) => r.recommendedPostId)
      : [];
    const t = locale !== DEFAULT_LOCALE ? post.translations?.find((x: any) => x.locale === locale) : null;
    const categoryT =
      locale !== DEFAULT_LOCALE ? post.category?.translations?.find((x: any) => x.locale === locale) : null;

    const { recommendationsPost, _count, translations, ...rest } = post;
    const category = post.category ? (({ translations: _ct, ...c }: any) => c)(post.category) : post.category;
    return {
      ...rest,
      category,
      title: t?.title ?? post.title,
      description: t?.description ?? post.description,
      locale: t ? locale : DEFAULT_LOCALE,
      translations: (translations ?? []).map((x: any) => ({ locale: x.locale, title: x.title, description: x.description })),
      authorName: post.author?.name ?? '',
      categoryName: categoryT?.name ?? post.category?.name ?? '',
      commentsCount: _count ? _count.comments : 0,
      recommendedPostIds,
    };
  }

  /** Cria ou substitui as traduções enviadas (o idioma padrão fica no registro principal). */
  private async saveTranslations(postId: string, translations?: PostTranslationDto[]) {
    for (const t of translations ?? []) {
      if (t.locale === DEFAULT_LOCALE) continue;
      await this.prisma.postTranslation.upsert({
        where: { postId_locale: { postId, locale: t.locale } },
        create: { postId, locale: t.locale, title: t.title, description: t.description },
        update: { title: t.title, description: t.description },
      });
    }
  }

  async create(dto: CreatePostDto) {
    const blogId = TenantContext.getTenantId();
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.title);

    const existingSlug = await this.prisma.post.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Post already exists with slug: ${slug}`);
    }

    const category = await this.prisma.category.findFirst({
      where: { id: dto.categoryId, blogId },
    });
    if (!category) {
      throw new NotFoundException(`Category not found with id: ${dto.categoryId}`);
    }

    const author = await this.prisma.author.findFirst({
      where: { id: dto.authorId, blogId },
    });
    if (!author) {
      throw new NotFoundException(`Author not found with id: ${dto.authorId}`);
    }

    const publishedAt = dto.published ? new Date() : null;

    const post = await this.prisma.post.create({
      data: {
        blogId,
        authorId: dto.authorId,
        categoryId: dto.categoryId,
        title: dto.title,
        description: dto.description,
        imageUrl: dto.imageUrl,
        slug,
        readingTime: dto.readingTime || '5 min',
        published: dto.published,
        status: Status.ACTIVE,
        publishedAt,
        views: BigInt(0),
        likes: BigInt(0),
      },
      include: this.postInclude,
    });

    if (dto.recommendedPostIds && dto.recommendedPostIds.length > 0) {
      await this.prisma.postRecommendation.createMany({
        data: dto.recommendedPostIds.map((recommendedPostId) => ({
          postId: post.id,
          recommendedPostId,
        })),
        skipDuplicates: true,
      });
    }

    await this.saveTranslations(post.id, dto.translations);

    return this.findById(post.id, true);
  }

  /**
   * Filtro de visibilidade. Sem `includeUnpublished`, só posts publicados e ativos (o que o público pode ver);
   * rascunhos só aparecem para editores/admins (ver `canSeeUnpublished`) e para as operações internas.
   */
  private visibleOnly(includeUnpublished: boolean) {
    return includeUnpublished ? {} : { published: true, status: Status.ACTIVE };
  }

  async findById(id: string, includeUnpublished = false, locale: string = DEFAULT_LOCALE) {
    const blogId = TenantContext.getTenantId();
    const post = await this.prisma.post.findFirst({
      where: { id, blogId, ...this.visibleOnly(includeUnpublished) },
      include: this.postInclude,
    });

    if (!post) {
      throw new NotFoundException(`Post not found with id: ${id}`);
    }

    return this.mapPost(post, locale);
  }

  async findBySlug(slug: string, includeUnpublished = false, locale: string = DEFAULT_LOCALE) {
    const blogId = TenantContext.getTenantId();
    const post = await this.prisma.post.findFirst({
      where: { slug, blogId, ...this.visibleOnly(includeUnpublished) },
      include: this.postInclude,
    });

    if (!post) {
      throw new NotFoundException(`Post not found with slug: ${slug}`);
    }

    return this.mapPost(post, locale);
  }

  async findAllActive(includeUnpublished = false, locale: string = DEFAULT_LOCALE) {
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId, status: Status.ACTIVE, ...(includeUnpublished ? {} : { published: true }) },
      include: this.postInclude,
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p) => this.mapPost(p, locale));
  }

  async findAll(includeUnpublished = false, locale: string = DEFAULT_LOCALE) {
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId, ...this.visibleOnly(includeUnpublished) },
      include: this.postInclude,
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p) => this.mapPost(p, locale));
  }

  async findAllByStatus(status: Status, includeUnpublished = false, locale: string = DEFAULT_LOCALE) {
    // O público só enxerga posts ativos e publicados: qualquer outro status (inativo, removido...) não é listado.
    if (!includeUnpublished && status !== Status.ACTIVE) {
      return [];
    }
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId, status, ...(includeUnpublished ? {} : { published: true }) },
      include: this.postInclude,
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p) => this.mapPost(p, locale));
  }

  async findLatestPosts(limit: number, locale: string = DEFAULT_LOCALE) {
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId, published: true, status: Status.ACTIVE },
      include: this.postInclude,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return posts.map((p) => this.mapPost(p, locale));
  }

  async search(query: string, limit = 10, includeUnpublished = false, locale: string = DEFAULT_LOCALE) {
    if (!query || query.trim().length === 0) {
      return [];
    }
    const blogId = TenantContext.getTenantId();
    const trimmed = query.trim();
    const posts = await this.prisma.post.findMany({
      where: {
        blogId,
        ...this.visibleOnly(includeUnpublished),
        // Procura no idioma padrão e nas traduções (quem busca em inglês acha pelo título em inglês).
        OR: [
          { title: { contains: trimmed, mode: 'insensitive' } },
          { description: { contains: trimmed, mode: 'insensitive' } },
          {
            translations: {
              some: {
                OR: [
                  { title: { contains: trimmed, mode: 'insensitive' } },
                  { description: { contains: trimmed, mode: 'insensitive' } },
                ],
              },
            },
          },
        ] satisfies Prisma.PostWhereInput[],
      },
      include: this.postInclude,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return posts.map((p) => this.mapPost(p, locale));
  }

  async findMostRelevant(limit: number, locale: string = DEFAULT_LOCALE) {
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId, published: true, status: Status.ACTIVE },
      include: this.postInclude,
    });

    const now = new Date();

    const scoredPosts = posts.map((post) => {
      const views = Number(post.views);
      const likes = Number(post.likes);
      const comments = post._count ? post._count.comments : 0;
      const daysSincePub = post.publishedAt
        ? Math.max(0, Math.floor((now.getTime() - post.publishedAt.getTime()) / (1000 * 60 * 60 * 24)))
        : 0;

      const score =
        views * WEIGHT_VIEWS +
        likes * WEIGHT_LIKES +
        comments * WEIGHT_COMMENTS -
        daysSincePub * DECAY_DAYS_PENALTY;

      return { post: this.mapPost(post, locale), score };
    });

    scoredPosts.sort((a, b) => b.score - a.score);
    return scoredPosts.slice(0, limit).map((s) => s.post);
  }

  async findRecommendedPosts(slug: string, includeUnpublished = false, locale: string = DEFAULT_LOCALE) {
    const currentPost = await this.findBySlug(slug, includeUnpublished);
    if (!currentPost.recommendedPostIds || currentPost.recommendedPostIds.length === 0) {
      return [];
    }

    const posts = await this.prisma.post.findMany({
      where: {
        id: { in: currentPost.recommendedPostIds },
        published: true,
        status: Status.ACTIVE,
      },
      include: this.postInclude,
    });

    return posts.map((p) => this.mapPost(p, locale));
  }

  async findNextPosts(slug: string, limit: number = 6, includeUnpublished = false, locale: string = DEFAULT_LOCALE) {
    const currentPost = await this.findBySlug(slug, includeUnpublished);
    const blogId = TenantContext.getTenantId();
    const currentPostId = currentPost.id;
    const categoryId = currentPost.categoryId;
    const publishedAt = currentPost.publishedAt;
    const excludedIds = new Set<string>([currentPostId, ...(currentPost.recommendedPostIds || [])]);

    const resultPosts: any[] = [];
    const addedIds = new Set<string>();

    const addUnique = (posts: any[], maxCount: number) => {
      for (const p of posts) {
        if (!excludedIds.has(p.id) && !addedIds.has(p.id)) {
          addedIds.add(p.id);
          resultPosts.push(this.mapPost(p, locale));
          if (resultPosts.length >= limit) return;
        }
      }
    };

    // 1. Até 2 posts da mesma categoria
    const sameCategoryPosts = await this.prisma.post.findMany({
      where: { blogId, categoryId, published: true, status: Status.ACTIVE, NOT: { id: currentPostId } },
      include: this.postInclude,
      orderBy: { publishedAt: 'desc' },
      take: 5,
    });
    addUnique(sameCategoryPosts, 2);

    // 2. Até 2 posts publicados antes do atual
    if (resultPosts.length < limit && publishedAt) {
      const olderPosts = await this.prisma.post.findMany({
        where: {
          blogId,
          published: true,
          status: Status.ACTIVE,
          publishedAt: { lt: new Date(publishedAt) },
          NOT: { id: currentPostId },
        },
        include: this.postInclude,
        orderBy: { publishedAt: 'desc' },
        take: 5,
      });
      addUnique(olderPosts, 2);
    }

    // 3. Fallback: posts mais recentes gerais
    if (resultPosts.length < limit) {
      const latestPosts = await this.prisma.post.findMany({
        where: { blogId, published: true, status: Status.ACTIVE, NOT: { id: currentPostId } },
        include: this.postInclude,
        orderBy: { publishedAt: 'desc' },
        take: limit,
      });
      addUnique(latestPosts, limit - resultPosts.length);
    }

    return resultPosts.slice(0, limit);
  }

  async update(id: string, dto: UpdatePostDto) {
    const existing = await this.findById(id, true);

    let slug: string | undefined = undefined;
    if (dto.slug || dto.title) {
      slug = dto.slug ? this.slugify(dto.slug) : dto.title ? this.slugify(dto.title) : undefined;
      if (slug) {
        const conflict = await this.prisma.post.findFirst({
          where: { slug, NOT: { id } },
        });
        if (conflict) {
          throw new ConflictException(`Post already exists with slug: ${slug}`);
        }
      }
    }

    let publishedAt = existing.publishedAt;
    if (dto.published && !existing.published && !existing.publishedAt) {
      publishedAt = new Date();
    }

    await this.prisma.post.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description && { description: dto.description }),
        ...(dto.imageUrl !== undefined && { imageUrl: dto.imageUrl }),
        ...(slug && { slug }),
        ...(dto.readingTime && { readingTime: dto.readingTime }),
        ...(dto.published !== undefined && { published: dto.published }),
        ...(dto.categoryId && { categoryId: dto.categoryId }),
        ...(dto.authorId && { authorId: dto.authorId }),
        publishedAt,
      },
    });

    if (dto.recommendedPostIds !== undefined) {
      await this.prisma.postRecommendation.deleteMany({ where: { postId: id } });
      if (dto.recommendedPostIds.length > 0) {
        await this.prisma.postRecommendation.createMany({
          data: dto.recommendedPostIds.map((recommendedPostId) => ({
            postId: id,
            recommendedPostId,
          })),
          skipDuplicates: true,
        });
      }
    }

    await this.saveTranslations(id, dto.translations);

    return this.findById(id, true);
  }

  async updateStatus(id: string, status: Status) {
    await this.findById(id, true);
    await this.prisma.post.update({
      where: { id },
      data: { status },
    });
    return this.findById(id, true);
  }

  async incrementViews(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const post = isUuid
      ? await this.prisma.post.findUnique({ where: { id: idOrSlug } })
      : await this.prisma.post.findUnique({ where: { slug: idOrSlug } });

    if (!post) {
      throw new NotFoundException(`Post not found with identifier: ${idOrSlug}`);
    }

    // Rascunhos e posts removidos não contam visualizações (inclusive prévias de editores).
    if (!post.published || post.status !== Status.ACTIVE) {
      return;
    }

    await this.prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
  }

  async softDelete(id: string) {
    await this.findById(id, true);
    await this.prisma.post.update({
      where: { id },
      data: { status: Status.DELETED },
    });
  }

  async hardDelete(id: string) {
    await this.findById(id, true);
    await this.prisma.post.delete({
      where: { id },
    });
  }
}
