import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Status } from '@prisma/client';

@Injectable()
export class CategoriesService {
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

  async create(dto: CreateCategoryDto) {
    const blogId = TenantContext.getTenantId();
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    const existing = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existing) {
      throw new ConflictException(`Category already exists with slug: ${slug}`);
    }

    return this.prisma.category.create({
      data: {
        blogId,
        name: dto.name,
        description: dto.description,
        slug,
        status: Status.ACTIVE,
      },
    });
  }

  async findById(id: string) {
    const blogId = TenantContext.getTenantId();
    const category = await this.prisma.category.findFirst({
      where: { id, blogId },
    });

    if (!category) {
      throw new NotFoundException(`Category not found with id: ${id}`);
    }

    return category;
  }

  async findByName(name: string) {
    const blogId = TenantContext.getTenantId();
    const category = await this.prisma.category.findFirst({
      where: {
        blogId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category not found with name: ${name}`);
    }

    return category;
  }

  async findBySlug(slug: string) {
    const blogId = TenantContext.getTenantId();
    const category = await this.prisma.category.findFirst({
      where: { slug, blogId },
    });

    if (!category) {
      throw new NotFoundException(`Category not found with slug: ${slug}`);
    }

    return category;
  }

  async findAllActive() {
    const blogId = TenantContext.getTenantId();
    return this.prisma.category.findMany({
      where: { blogId, status: Status.ACTIVE },
      orderBy: { name: 'asc' },
    });
  }

  async findAll() {
    const blogId = TenantContext.getTenantId();
    return this.prisma.category.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: Status) {
    const blogId = TenantContext.getTenantId();
    return this.prisma.category.findMany({
      where: { blogId, status },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: UpdateCategoryDto) {
    await this.findById(id);

    let slug: string | undefined = undefined;
    if (dto.slug || dto.name) {
      slug = dto.slug ? this.slugify(dto.slug) : dto.name ? this.slugify(dto.name) : undefined;
      if (slug) {
        const conflict = await this.prisma.category.findFirst({
          where: { slug, NOT: { id } },
        });
        if (conflict) {
          throw new ConflictException(`Category already exists with slug: ${slug}`);
        }
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description && { description: dto.description }),
        ...(slug && { slug }),
      },
    });
  }

  async updateStatus(id: string, status: Status) {
    await this.findById(id);
    return this.prisma.category.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);
    await this.prisma.category.update({
      where: { id },
      data: { status: Status.DELETED },
    });
  }

  async hardDelete(id: string) {
    await this.findById(id);
    await this.prisma.category.delete({
      where: { id },
    });
  }
}
