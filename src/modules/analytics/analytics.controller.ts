import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('events/count')
  @ApiOperation({
    summary: 'Total de eventos',
    description:
      'Filtro por `period` ou intervalo explícito `from`/`to` (ISO 8601). Intervalo explícito tem precedência.',
  })
  async getEventsCount(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getEventsCount(query);
  }

  @Get('events/grouped')
  @ApiOperation({ summary: 'Contagem agrupada por nome do evento' })
  async getEventsGrouped(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getEventsGrouped(query);
  }

  @Get('users/:id/events/count')
  @ApiOperation({ summary: 'Total de eventos de um usuário' })
  async getUserEventsCount(
    @Param('id') id: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getUserEventsCount(id, query);
  }
}
