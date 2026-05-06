import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsISO8601, IsOptional } from 'class-validator';

export class AnalyticsQueryDto {
  @ApiPropertyOptional({ enum: ['24h', '7d', '30d'] })
  @IsOptional()
  @IsIn(['24h', '7d', '30d'])
  period?: '24h' | '7d' | '30d';

  @ApiPropertyOptional({
    description: 'Início do intervalo (ISO 8601). Sobrepõe `period` se combinado com `to`.',
    example: '2026-05-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  from?: string;

  @ApiPropertyOptional({
    description: 'Fim do intervalo (ISO 8601). Padrão: agora.',
    example: '2026-05-06T23:59:59.999Z',
  })
  @IsOptional()
  @IsISO8601({ strict: true })
  to?: string;
}
