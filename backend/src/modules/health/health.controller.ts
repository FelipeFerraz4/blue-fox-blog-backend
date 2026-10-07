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
    summary: 'Check application and database health status',
    description: 'Performs health checks on database connectivity (Prisma/PostgreSQL) and memory heap/rss consumption.',
  })
  @ApiResponse({ status: 200, description: 'Application and database are operational.' })
  @ApiResponse({ status: 503, description: 'One or more system dependencies are unavailable.' })
  check() {
    const heapLimit = (Number(process.env.HEALTH_HEAP_LIMIT_MB) || 500) * 1024 * 1024;
    const rssLimit = (Number(process.env.HEALTH_RSS_LIMIT_MB) || 1024) * 1024 * 1024;

    return this.health.check([
      () => this.prismaHealth.isHealthy('database'),
      () => this.memory.checkHeap('memory_heap', heapLimit),
      () => this.memory.checkRSS('memory_rss', rssLimit),
    ]);
  }
}
