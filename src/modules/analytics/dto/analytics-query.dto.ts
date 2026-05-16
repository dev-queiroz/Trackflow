import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: ['24h', '7d', '30d'] })
  @IsOptional()
  @IsIn(['24h', '7d', '30d'])
  period?: '24h' | '7d' | '30d';

  @ApiPropertyOptional({
    description:
      'Start of the range (ISO 8601). Overrides `period` when combined with `to`.',
    example: '2026-05-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  @ApiPropertyOptional({
    description: 'End of the range (ISO 8601). Default: now.',
    example: '2026-05-06T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string;
}
