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
    summary: 'Total events',
    description:
      'Filter by `period` or an explicit `from`/`to` range (ISO 8601). The explicit range takes precedence.',
  })
  async getEventsCount(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getEventsCount(query);
  }

  @Get('events/grouped')
  @ApiOperation({ summary: 'Count grouped by event name' })
  async getEventsGrouped(@Query() query: AnalyticsQueryDto) {
    return this.analyticsService.getEventsGrouped(query);
  }

  @Get('users/:id/events/count')
  @ApiOperation({ summary: 'Total events for a user' })
  async getUserEventsCount(
    @Param('id') id: string,
    @Query() query: AnalyticsQueryDto,
  ) {
    return this.analyticsService.getUserEventsCount(id, query);
  }
}
