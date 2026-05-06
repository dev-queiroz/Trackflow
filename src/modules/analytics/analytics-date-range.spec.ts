import { BadRequestException } from '@nestjs/common';
import {
  buildEventCreatedAtWhere,
  AnalyticsDateQuery,
} from './analytics-date-range';

describe('buildEventCreatedAtWhere', () => {
  it('retorna vazio quando não há filtros', () => {
    expect(buildEventCreatedAtWhere({})).toEqual({});
  });

  it('aplica período relativo (~24h)', () => {
    const q: AnalyticsDateQuery = { period: '24h' };
    const where = buildEventCreatedAtWhere(q);
    expect(where.createdAt?.gte).toBeInstanceOf(Date);
    expect(where.createdAt?.lte).toBeInstanceOf(Date);
    const span =
      (where.createdAt!.lte as Date).getTime() -
      (where.createdAt!.gte as Date).getTime();
    const day = 24 * 60 * 60 * 1000;
    expect(span).toBeGreaterThanOrEqual(day - 100);
    expect(span).toBeLessThanOrEqual(day + 100);
  });

  it('intervalo explícito from/to', () => {
    const where = buildEventCreatedAtWhere({
      from: '2026-05-01T00:00:00.000Z',
      to: '2026-05-02T00:00:00.000Z',
    });
    expect(where.createdAt?.gte?.toISOString()).toBe('2026-05-01T00:00:00.000Z');
    expect(where.createdAt?.lte?.toISOString()).toBe('2026-05-02T00:00:00.000Z');
  });

  it('rejeita from inválido', () => {
    expect(() =>
      buildEventCreatedAtWhere({ from: 'não-é-data' }),
    ).toThrow(BadRequestException);
  });

  it('rejeita quando to < from', () => {
    expect(() =>
      buildEventCreatedAtWhere({
        from: '2026-05-10T00:00:00.000Z',
        to: '2026-05-01T00:00:00.000Z',
      }),
    ).toThrow(BadRequestException);
  });
});
