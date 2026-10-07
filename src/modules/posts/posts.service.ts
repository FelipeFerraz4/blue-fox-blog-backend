import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Status } from '@prisma/client';

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
    category: true,
    author: true,
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

  private mapPost(post: any) {
    if (!post) return null;
    const recommendedPostIds = post.recommendationsPost
      ? post.recommendationsPost.map((r: any) => r.recommendedPostId)
      : [];

    const { recommendationsPost, _count, ...rest } = post;
    return {
      ...rest,
      authorName: post.author?.name ?? '',
      categoryName: post.category?.name ?? '',
      commentsCount: _count ? _count.comments : 0,
      recommendedPostIds,
    };
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

    return this.findById(post.id);
  }

  async findById(id: string) {
    const blogId = TenantContext.getTenantId();
    const post = await this.prisma.post.findFirst({
      where: { id, blogId },
      include: this.postInclude,
    });

    if (!post) {
      throw new NotFoundException(`Post not found with id: ${id}`);
    }

    return this.mapPost(post);
  }

  async findBySlug(slug: string) {
    const blogId = TenantContext.getTenantId();
    const post = await this.prisma.post.findFirst({
      where: { slug, blogId },
      include: this.postInclude,
    });

    if (!post) {
      throw new NotFoundException(`Post not found with slug: ${slug}`);
    }

    return this.mapPost(post);
  }

  async findAllActive() {
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId, status: Status.ACTIVE },
      include: this.postInclude,
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p) => this.mapPost(p));
  }

  async findAll() {
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId },
      include: this.postInclude,
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p) => this.mapPost(p));
  }

  async findAllByStatus(status: Status) {
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId, status },
      include: this.postInclude,
      orderBy: { createdAt: 'desc' },
    });
    return posts.map((p) => this.mapPost(p));
  }

  async findLatestPosts(limit: number) {
    const blogId = TenantContext.getTenantId();
    const posts = await this.prisma.post.findMany({
      where: { blogId, published: true, status: Status.ACTIVE },
      include: this.postInclude,
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    return posts.map((p) => this.mapPost(p));
  }

  async findMostRelevant(limit: number) {
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

      return { post: this.mapPost(post), score };
    });

    scoredPosts.sort((a, b) => b.score - a.score);
    return scoredPosts.slice(0, limit).map((s) => s.post);
  }

  async findRecommendedPosts(slug: string) {
    const currentPost = await this.findBySlug(slug);
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

    return posts.map((p) => this.mapPost(p));
  }

  async findNextPosts(slug: string, limit: number = 6) {
    const currentPost = await this.findBySlug(slug);
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
          resultPosts.push(this.mapPost(p));
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
    const existing = await this.findById(id);

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

    return this.findById(id);
  }

  async updateStatus(id: string, status: Status) {
    await this.findById(id);
    await this.prisma.post.update({
      where: { id },
      data: { status },
    });
    return this.findById(id);
  }

  async incrementViews(idOrSlug: string) {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(idOrSlug);
    const post = isUuid
      ? await this.prisma.post.findUnique({ where: { id: idOrSlug } })
      : await this.prisma.post.findUnique({ where: { slug: idOrSlug } });

    if (!post) {
      throw new NotFoundException(`Post not found with identifier: ${idOrSlug}`);
    }

    await this.prisma.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);
    await this.prisma.post.update({
      where: { id },
      data: { status: Status.DELETED },
    });
  }

  async hardDelete(id: string) {
    await this.findById(id);
    await this.prisma.post.delete({
      where: { id },
    });
  }
}
