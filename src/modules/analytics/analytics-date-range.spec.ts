import { BadRequestException } from '@nestjs/common';
import {
  buildEventCreatedAtWhere,
  AnalyticsDateQuery,
} from './analytics-date-range';

describe('buildEventCreatedAtWhere', () => {
  it('returns empty when there are no filters', () => {
    expect(buildEventCreatedAtWhere({})).toEqual({});
  });

  it('applies a relative period (~24h)', () => {
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

  it('applies an explicit from/to range', () => {
    const where = buildEventCreatedAtWhere({
      from: '2026-05-01T00:00:00.000Z',
      to: '2026-05-02T00:00:00.000Z',
    });
    expect(where.createdAt?.gte?.toISOString()).toBe(
      '2026-05-01T00:00:00.000Z',
    );
    expect(where.createdAt?.lte?.toISOString()).toBe(
      '2026-05-02T00:00:00.000Z',
    );
  });

  it('rejects an invalid from value', () => {
    expect(() => buildEventCreatedAtWhere({ from: 'not-a-date' })).toThrow(
      BadRequestException,
    );
  });

  it('rejects when to < from', () => {
    expect(() =>
      buildEventCreatedAtWhere({
        from: '2026-05-10T00:00:00.000Z',
        to: '2026-05-01T00:00:00.000Z',
      }),
    ).toThrow(BadRequestException);
  });
});
