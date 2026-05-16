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
    summary: 'Liveness on /health',
    description:
      'Equivalent to /health/live for probes that only point to /health.',
  })
  root() {
    return this.health.check([]);
  }

  @Get('live')
  @HealthCheck()
  @ApiOperation({
    summary: 'Liveness',
    description:
      'Lightweight check for load balancers (no external dependencies). Path outside the `/v1` prefix.',
  })
  live() {
    return this.health.check([]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness',
    description:
      'PostgreSQL via Prisma and available heap. Path outside the `/v1` prefix.',
  })
  ready() {
    const heapLimitMb = Number(process.env.HEALTH_HEAP_LIMIT_MB) || 1536;

    return this.health.check([
      () => this.prismaHealth.pingCheck('database', this.prisma),
      () => this.memory.checkHeap('memory_heap', heapLimitMb * 1024 * 1024),
    ]);
  }
}
