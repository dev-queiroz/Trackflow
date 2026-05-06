import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  AnalyticsDateQuery,
  buildEventCreatedAtWhere,
} from './analytics-date-range';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getEventsCount(query: AnalyticsDateQuery) {
    const dateWhere = buildEventCreatedAtWhere(query);
    const count = await this.prisma.event.count({
      where: { ...dateWhere },
    });
    return { count };
  }

  async getEventsGrouped(query: AnalyticsDateQuery) {
    const dateWhere = buildEventCreatedAtWhere(query);
    const grouped = await this.prisma.event.groupBy({
      by: ['eventName'],
      _count: {
        eventName: true,
      },
      where: { ...dateWhere },
    });

    const result: Record<string, number> = {};
    grouped.forEach((item) => {
      result[item.eventName] = item._count.eventName;
    });

    return result;
  }

  async getUserEventsCount(userId: string, query: AnalyticsDateQuery) {
    const dateWhere = buildEventCreatedAtWhere(query);
    const count = await this.prisma.event.count({
      where: {
        userId,
        ...dateWhere,
      },
    });
    return { count };
  }
}
