import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Status } from '@prisma/client';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCommentDto) {
    const blogId = TenantContext.getTenantId();

    const post = await this.prisma.post.findFirst({
      where: { id: dto.postId, blogId },
    });
    if (!post) {
      throw new NotFoundException(`Post not found with id: ${dto.postId}`);
    }

    return this.prisma.comment.create({
      data: {
        blogId,
        postId: dto.postId,
        content: dto.content,
        authorName: dto.authorName,
        status: Status.ACTIVE,
      },
    });
  }

  async findByPost(postId: string) {
    const blogId = TenantContext.getTenantId();
    return this.prisma.comment.findMany({
      where: { postId, blogId, status: Status.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: Status) {
    const blogId = TenantContext.getTenantId();
    const comment = await this.prisma.comment.findFirst({
      where: { id, blogId },
    });
    if (!comment) {
      throw new NotFoundException(`Comment not found with id: ${id}`);
    }

    return this.prisma.comment.update({
      where: { id },
      data: { status },
    });
  }

  async softDelete(id: string) {
    const blogId = TenantContext.getTenantId();
    const comment = await this.prisma.comment.findFirst({
      where: { id, blogId },
    });
    if (!comment) {
      throw new NotFoundException(`Comment not found with id: ${id}`);
    }

    await this.prisma.comment.update({
      where: { id },
      data: { status: Status.DELETED },
    });
  }

  async hardDelete(id: string) {
    const blogId = TenantContext.getTenantId();
    const comment = await this.prisma.comment.findFirst({
      where: { id, blogId },
    });
    if (!comment) {
      throw new NotFoundException(`Comment not found with id: ${id}`);
    }

    await this.prisma.comment.delete({
      where: { id },
    });
  }
}
