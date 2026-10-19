import { Test, TestingModule } from '@nestjs/testing';
import { PostsService } from './posts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { Status } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

describe('PostsService (Unit Tests)', () => {
  let service: PostsService;
  let mockPrisma: any;

  const mockBlogId = '77e2c400-28ab-4add-b219-112233445566';

  beforeEach(async () => {
    mockPrisma = {
      post: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
  });

  describe('Relevance Ranking Formula (findMostRelevant)', () => {
    it('should compute relevance score with weights (views*0.5, likes*2, comments*3, days*0.1) and order descending', async () => {
      // Setup mock posts with different engagement metrics
      const now = new Date();
      const tenDaysAgo = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);

      const postA = {
        id: 'post-a',
        title: 'Older Post with high likes',
        views: 100, // 100 * 0.5 = 50
        likes: 50, // 50 * 2 = 100
        publishedAt: tenDaysAgo, // -10 * 0.1 = -1.0
        _count: { comments: 10 }, // 10 * 3 = 30 -> Total: 50 + 100 + 30 - 1 = 179
        recommendationsPost: [],
      };

      const postB = {
        id: 'post-b',
        title: 'Fresh Post with massive views and comments',
        views: 400, // 400 * 0.5 = 200
        likes: 20, // 20 * 2 = 40
        publishedAt: oneDayAgo, // -1 * 0.1 = -0.1
        _count: { comments: 20 }, // 20 * 3 = 60 -> Total: 200 + 40 + 60 - 0.1 = 299.9
        recommendationsPost: [],
      };

      mockPrisma.post.findMany.mockResolvedValue([postA, postB]);

      // Execute within tenant context
      const result = await TenantContext.run(mockBlogId, async () => {
        return service.findMostRelevant(5);
      });

      expect(result).toHaveLength(2);
      // Post B should be first because 299.9 > 179
      expect(result[0].id).toBe('post-b');
      expect(result[1].id).toBe('post-a');
    });
  });

  describe('incrementViews', () => {
    it('should increment post views atomically by 1 in Prisma', async () => {
      const mockPost = {
        id: 'post-1',
        title: 'Target Post',
        views: 42,
        published: true,
        status: Status.ACTIVE,
      };

      mockPrisma.post.findUnique = jest.fn().mockResolvedValue(mockPost);
      mockPrisma.post.update = jest.fn().mockResolvedValue({
        ...mockPost,
        views: 43,
      });

      await TenantContext.run(mockBlogId, async () => {
        return service.incrementViews('post-1');
      });

      expect(mockPrisma.post.update).toHaveBeenCalledWith({
        where: { id: 'post-1' },
        data: { views: { increment: 1 } },
      });
    });
  });

  describe('Draft visibility', () => {
    const run = <T>(fn: () => Promise<T>) => TenantContext.run(mockBlogId, fn);
    const publishedActive = { published: true, status: Status.ACTIVE };

    it('findBySlug hides drafts and removed posts from the public (404)', async () => {
      mockPrisma.post.findFirst.mockResolvedValue(null);

      await expect(run(() => service.findBySlug('tetra-fish-guide'))).rejects.toThrow(NotFoundException);

      expect(mockPrisma.post.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'tetra-fish-guide', blogId: mockBlogId, ...publishedActive } }),
      );
    });

    it('findBySlug returns drafts to editors (includeUnpublished)', async () => {
      mockPrisma.post.findFirst.mockResolvedValue({ id: 'draft-1', slug: 'tetra-fish-guide', published: false });

      const post = await run(() => service.findBySlug('tetra-fish-guide', true));

      expect(post.id).toBe('draft-1');
      expect(mockPrisma.post.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({ where: { slug: 'tetra-fish-guide', blogId: mockBlogId } }),
      );
    });

    it('findById hides drafts from the public but not from editors', async () => {
      mockPrisma.post.findFirst.mockResolvedValue(null);
      await expect(run(() => service.findById('id-1'))).rejects.toThrow(NotFoundException);
      expect(mockPrisma.post.findFirst).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { id: 'id-1', blogId: mockBlogId, ...publishedActive } }),
      );

      mockPrisma.post.findFirst.mockResolvedValue({ id: 'id-1', published: false });
      await run(() => service.findById('id-1', true));
      expect(mockPrisma.post.findFirst).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { id: 'id-1', blogId: mockBlogId } }),
      );
    });

    it('findAllActive lists only published posts for the public, and drafts too for editors', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);

      await run(() => service.findAllActive());
      expect(mockPrisma.post.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { blogId: mockBlogId, status: Status.ACTIVE, published: true } }),
      );

      await run(() => service.findAllActive(true));
      expect(mockPrisma.post.findMany).toHaveBeenLastCalledWith(
        expect.objectContaining({ where: { blogId: mockBlogId, status: Status.ACTIVE } }),
      );
    });

    it('findAll (public) never returns drafts or removed posts', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);

      await run(() => service.findAll());

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { blogId: mockBlogId, ...publishedActive } }),
      );
    });

    it('findAllByStatus gives the public nothing but active published posts', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);

      // status diferente de ACTIVE: nem consulta o banco
      expect(await run(() => service.findAllByStatus(Status.DELETED))).toEqual([]);
      expect(await run(() => service.findAllByStatus(Status.INACTIVE))).toEqual([]);
      expect(mockPrisma.post.findMany).not.toHaveBeenCalled();

      await run(() => service.findAllByStatus(Status.ACTIVE));
      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { blogId: mockBlogId, status: Status.ACTIVE, published: true } }),
      );
    });

    it('findAllByStatus lets editors list any status', async () => {
      mockPrisma.post.findMany.mockResolvedValue([]);

      await run(() => service.findAllByStatus(Status.DELETED, true));

      expect(mockPrisma.post.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { blogId: mockBlogId, status: Status.DELETED } }),
      );
    });

    it('incrementViews does not count drafts or removed posts, and does not reveal them', async () => {
      mockPrisma.post.update = jest.fn();

      mockPrisma.post.findUnique = jest.fn().mockResolvedValue({ id: 'd1', published: false, status: Status.ACTIVE });
      await expect(run(() => service.incrementViews('tetra-fish-guide'))).resolves.toBeUndefined();

      mockPrisma.post.findUnique = jest.fn().mockResolvedValue({ id: 'd2', published: true, status: Status.DELETED });
      await expect(run(() => service.incrementViews('old-post'))).resolves.toBeUndefined();

      expect(mockPrisma.post.update).not.toHaveBeenCalled();
    });
  });
});
