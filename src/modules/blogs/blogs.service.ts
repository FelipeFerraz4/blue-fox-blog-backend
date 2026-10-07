import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { Status } from '@prisma/client';

@Injectable()
export class BlogsService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentBlog() {
    const blogId = TenantContext.getTenantId();
    const blog = await this.prisma.blog.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      throw new NotFoundException(`Blog not found with id: ${blogId}`);
    }

    return blog;
  }

  async findBySlug(slug: string) {
    const blog = await this.prisma.blog.findUnique({
      where: { slug },
    });

    if (!blog) {
      throw new NotFoundException(`Blog not found with slug: ${slug}`);
    }

    return blog;
  }

  async findAllActive() {
    return this.prisma.blog.findMany({
      where: { status: Status.ACTIVE },
      orderBy: { name: 'asc' },
    });
  }
}
