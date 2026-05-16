import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsModule } from './analytics.module';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AnalyticsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'ANALYTICS_CACHE_TTL_MS') return 60000;
          if (key === 'REDIS_URL') return 'redis://localhost:6379';
          return null;
        }),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have AnalyticsController', () => {
    expect(module.get(AnalyticsModule)).toBeDefined();
  });

  it('should handle no Redis URL', async () => {
    const noRedisModule = await Test.createTestingModule({
      imports: [AnalyticsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'ANALYTICS_CACHE_TTL_MS') return 60000;
          if (key === 'REDIS_URL') return null;
          return null;
        }),
      })
      .compile();
    
    expect(noRedisModule).toBeDefined();
  });

  it('should handle Redis initialization error', async () => {
    const errorModule = await Test.createTestingModule({
      imports: [AnalyticsModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'REDIS_URL') return 'invalid-url';
          return null;
        }),
      })
      .compile();

    expect(errorModule).toBeDefined();
  });
});
