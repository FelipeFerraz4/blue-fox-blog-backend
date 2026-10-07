import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService, MemoryHealthIndicator } from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaHealthIndicator } from './prisma.health';
import { Public } from '../auth/public.decorator';

@ApiTags('Health')
@Public()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Verifica o status de saúde da aplicação',
    description: 'Realiza health check da conexão com PostgreSQL/Prisma e consumo de memória.',
  })
  @ApiResponse({ status: 200, description: 'Aplicação e banco de dados operacionais.' })
  @ApiResponse({ status: 503, description: 'Uma ou mais dependências estão indisponíveis.' })
  check() {
    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024), // 300MB heap
      () => this.memory.checkRSS('memory_rss', 500 * 1024 * 1024),   // 500MB RSS
    ]);
  }
}
