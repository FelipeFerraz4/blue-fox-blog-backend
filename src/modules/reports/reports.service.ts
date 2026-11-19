import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ReportStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { TenantContext } from '../tenant/tenant.context';
import { CreateReportDto, ReportQueryDto, UpdateReportDto } from './dto/report.dto';
import { ReportRateLimiter } from './report-rate-limiter';

const RESOLVED: ReportStatus[] = [ReportStatus.FIXED, ReportStatus.DISMISSED];

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly limiter: ReportRateLimiter,
  ) {}

  /**
   * Recebe um relato público. Robôs que preenchem o campo-isca recebem a mesma resposta de sucesso,
   * mas nada é gravado. A resposta nunca devolve o id nem os dados (o relato é privado).
   */
  async create(dto: CreateReportDto, ip: string): Promise<{ received: true }> {
    if (!this.limiter.allow(ip)) {
      throw new HttpException('Too many reports from this address. Try again later.', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (dto.website?.trim()) return { received: true };

    const { website: _honeypot, ...data } = dto;
    await this.prisma.report.create({ data: { ...data, blogId: TenantContext.getTenantId() } });
    return { received: true };
  }

  findAll(query: ReportQueryDto) {
    const blogId = TenantContext.getTenantId();
    return this.prisma.report.findMany({
      where: {
        blogId,
        ...(query.status && { status: query.status }),
        ...(query.targetType && { targetType: query.targetType }),
        ...(query.targetSlug && { targetSlug: query.targetSlug }),
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
  }

  async findById(id: string) {
    const report = await this.prisma.report.findFirst({ where: { id, blogId: TenantContext.getTenantId() } });
    if (!report) throw new NotFoundException(`Report not found: ${id}`);
    return report;
  }

  /** Muda status e/ou nota interna. `resolvedAt` acompanha: preenchido ao corrigir/descartar, limpo ao reabrir. */
  async update(id: string, dto: UpdateReportDto) {
    await this.findById(id);
    return this.prisma.report.update({
      where: { id },
      data: {
        ...(dto.internalNote !== undefined && { internalNote: dto.internalNote }),
        ...(dto.status && { status: dto.status, resolvedAt: RESOLVED.includes(dto.status) ? new Date() : null }),
      },
    });
  }

  /** Exclusão definitiva (ex.: pedido do leitor para apagar o e-mail, LGPD). */
  async remove(id: string) {
    await this.findById(id);
    await this.prisma.report.delete({ where: { id } });
  }
}
