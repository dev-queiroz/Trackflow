import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

describe('AnalyticsController', () => {
  let controller: AnalyticsController;
  let service: AnalyticsService;

  beforeEach(async () => {
    const mockAnalyticsService = {
      getEventsCount: jest.fn().mockResolvedValue({ count: 10 }),
      getEventsGrouped: jest.fn().mockResolvedValue({ page_view: 10 }),
      getUserEventsCount: jest.fn().mockResolvedValue({ count: 5 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
      providers: [
        { provide: AnalyticsService, useValue: mockAnalyticsService },
        { provide: CACHE_MANAGER, useValue: { get: jest.fn(), set: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getEventsCount delega ao service', async () => {
    await expect(
      controller.getEventsCount({ period: '24h' }),
    ).resolves.toEqual({ count: 10 });
    expect(service.getEventsCount).toHaveBeenCalledWith({ period: '24h' });
  });

  it('getEventsCount vazio', async () => {
    await expect(controller.getEventsCount({})).resolves.toEqual({ count: 10 });
    expect(service.getEventsCount).toHaveBeenCalledWith({});
  });

  it('getEventsGrouped', async () => {
    await expect(controller.getEventsGrouped({ period: '7d' })).resolves.toEqual({
      page_view: 10,
    });
    expect(service.getEventsGrouped).toHaveBeenCalledWith({ period: '7d' });
  });

  it('getUserEventsCount', async () => {
    await expect(
      controller.getUserEventsCount('1', { period: '30d' }),
    ).resolves.toEqual({ count: 5 });
    expect(service.getUserEventsCount).toHaveBeenCalledWith('1', {
      period: '30d',
    });
  });
});
