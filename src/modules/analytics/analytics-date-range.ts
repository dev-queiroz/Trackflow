import { BadRequestException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';

export type AnalyticsPeriod = '24h' | '7d' | '30d';

export interface AnalyticsDateQuery {
  period?: AnalyticsPeriod;
  from?: string;
  to?: string;
}

function parseInstant(iso: string, label: string): Date {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    throw new BadRequestException(`${label} must be a valid ISO 8601 date`);
  }
  return d;
}

function periodToMs(period: AnalyticsPeriod): number {
  const day = 24 * 60 * 60 * 1000;
  const map: Record<AnalyticsPeriod, number> = {
    '24h': day,
    '7d': 7 * day,
    '30d': 30 * day,
  };
  return map[period];
}

/**
 * Builds a Prisma filter on `createdAt`.
 * Precedence: explicit `from`/`to` overrides `period`.
 */
export function buildEventCreatedAtWhere(
  query: AnalyticsDateQuery,
): Pick<Prisma.EventWhereInput, 'createdAt'> {
  const now = new Date();

  if (query.from || query.to) {
    const fromDate = query.from ? parseInstant(query.from, 'from') : undefined;
    const toDate = query.to ? parseInstant(query.to, 'to') : now;

    if (fromDate && toDate < fromDate) {
      throw new BadRequestException(
        '"to" must be greater than or equal to "from"',
      );
    }

    const range: Prisma.DateTimeFilter = {};
    if (fromDate) range.gte = fromDate;
    if (query.to) range.lte = toDate;
    else if (fromDate) range.lte = now;

    return Object.keys(range).length ? { createdAt: range } : {};
  }

  if (query.period) {
    const lte = now;
    const gte = new Date(lte.getTime() - periodToMs(query.period));
    return { createdAt: { gte, lte } };
  }

  return {};
}
