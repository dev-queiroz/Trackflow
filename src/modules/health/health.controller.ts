import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../prisma/prisma.service';

@ApiTags('Health')
@SkipThrottle()
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaHealth: PrismaHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness em /health',
    description: 'Equivalente a /health/live para probes que apontam apenas para /health.',
  })
  root() {
    return this.health.check([]);
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness',
    description:
      'Checagem leve para balanceadores (sem dependências externas). Caminho fora do prefixo `/v1`.',
  })
  live() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness',
    description:
      'PostgreSQL via Prisma e heap disponível. Caminho fora do prefixo `/v1`.',
  })
  ready() {
    const heapLimitMb =
      Number(process.env.HEALTH_HEAP_LIMIT_MB) || 1536;

    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () =>
        this.memory.checkHeap('memory_heap', heapLimitMb * 1024 * 1024),
    ]);
  }
}
