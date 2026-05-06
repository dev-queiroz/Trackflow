import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrisma = {
    event: {
      count: jest.fn().mockResolvedValue(10),
      groupBy: jest
        .fn()
        .mockResolvedValue([{ eventName: 'click', _count: { eventName: 10 } }]),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getEventsCount sem filtro', async () => {
    const result = await service.getEventsCount({});
    expect(result).toEqual({ count: 10 });
    expect(prisma.event.count).toHaveBeenCalledWith({ where: {} });
  });

  it('getEventsCount com período', async () => {
    const result = await service.getEventsCount({ period: '24h' });
    expect(result).toEqual({ count: 10 });
    expect(prisma.event.count).toHaveBeenCalled();
  });

  it('getEventsGrouped', async () => {
    const result = await service.getEventsGrouped({});
    expect(result).toEqual({ click: 10 });
    expect(prisma.event.groupBy).toHaveBeenCalled();
  });

  it('getUserEventsCount', async () => {
    const result = await service.getUserEventsCount('user-1', {
      period: '7d',
    });
    expect(result).toEqual({ count: 10 });
    expect(prisma.event.count).toHaveBeenCalled();
  });
});
