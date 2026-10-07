import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { CreateAuthorDto } from './dto/create-author.dto';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { Status } from '@prisma/client';

@Injectable()
export class AuthorsService {
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

  async create(dto: CreateAuthorDto) {
    const blogId = TenantContext.getTenantId();
    const slug = dto.slug ? this.slugify(dto.slug) : this.slugify(dto.name);

    const existingSlug = await this.prisma.author.findUnique({
      where: { slug },
    });
    if (existingSlug) {
      throw new ConflictException(`Author already exists with slug: ${slug}`);
    }

    const existingEmail = await this.prisma.author.findUnique({
      where: { email: dto.email },
    });
    if (existingEmail) {
      throw new ConflictException(`Author already exists with email: ${dto.email}`);
    }

    return this.prisma.author.create({
      data: {
        blogId,
        name: dto.name,
        bio: dto.bio,
        profilePictureUrl: dto.profilePictureUrl,
        slug,
        email: dto.email,
        status: Status.ACTIVE,
      },
    });
  }

  async findById(id: string) {
    const blogId = TenantContext.getTenantId();
    const author = await this.prisma.author.findFirst({
      where: { id, blogId },
    });

    if (!author) {
      throw new NotFoundException(`Author not found with id: ${id}`);
    }

    return author;
  }

  async findByName(name: string) {
    const blogId = TenantContext.getTenantId();
    const author = await this.prisma.author.findFirst({
      where: {
        blogId,
        name: { equals: name, mode: 'insensitive' },
      },
    });

    if (!author) {
      throw new NotFoundException(`Author not found with name: ${name}`);
    }

    return author;
  }

  async findBySlug(slug: string) {
    const blogId = TenantContext.getTenantId();
    const author = await this.prisma.author.findFirst({
      where: { slug, blogId },
    });

    if (!author) {
      throw new NotFoundException(`Author not found with slug: ${slug}`);
    }

    return author;
  }

  async findByEmail(email: string) {
    const blogId = TenantContext.getTenantId();
    const author = await this.prisma.author.findFirst({
      where: {
        blogId,
        email: { equals: email, mode: 'insensitive' },
      },
    });

    if (!author) {
      throw new NotFoundException(`Author not found with email: ${email}`);
    }

    return author;
  }

  async findAllActive() {
    const blogId = TenantContext.getTenantId();
    return this.prisma.author.findMany({
      where: { blogId, status: Status.ACTIVE },
      orderBy: { name: 'asc' },
    });
  }

  async findAll() {
    const blogId = TenantContext.getTenantId();
    return this.prisma.author.findMany({
      where: { blogId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByStatus(status: Status) {
    const blogId = TenantContext.getTenantId();
    return this.prisma.author.findMany({
      where: { blogId, status },
      orderBy: { name: 'asc' },
    });
  }

  async update(id: string, dto: UpdateAuthorDto) {
    await this.findById(id);

    let slug: string | undefined = undefined;
    if (dto.slug || dto.name) {
      slug = dto.slug ? this.slugify(dto.slug) : dto.name ? this.slugify(dto.name) : undefined;
      if (slug) {
        const conflict = await this.prisma.author.findFirst({
          where: { slug, NOT: { id } },
        });
        if (conflict) {
          throw new ConflictException(`Author already exists with slug: ${slug}`);
        }
      }
    }

    if (dto.email) {
      const emailConflict = await this.prisma.author.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (emailConflict) {
        throw new ConflictException(`Author already exists with email: ${dto.email}`);
      }
    }

    return this.prisma.author.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.bio !== undefined && { bio: dto.bio }),
        ...(dto.profilePictureUrl !== undefined && { profilePictureUrl: dto.profilePictureUrl }),
        ...(slug && { slug }),
        ...(dto.email && { email: dto.email }),
      },
    });
  }

  async updateStatus(id: string, status: Status) {
    await this.findById(id);
    return this.prisma.author.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(id: string) {
    await this.findById(id);
    await this.prisma.author.update({
      where: { id },
      data: { status: Status.DELETED },
    });
  }

  async hardDelete(id: string) {
    await this.findById(id);
    await this.prisma.author.delete({
      where: { id },
    });
  }
}
