import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '../../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;

  const mockHealth = {
    check: jest.fn().mockResolvedValue({
      status: 'ok',
      info: {},
      error: {},
      details: {},
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        { provide: HealthCheckService, useValue: mockHealth },
        {
          provide: PrismaHealthIndicator,
          useValue: {
            pingCheck: jest
              .fn()
              .mockResolvedValue({ database: { status: 'up' } }),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest
              .fn()
              .mockResolvedValue({ memory_heap: { status: 'up' } }),
          },
        },
        { provide: PrismaService, useValue: {} },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('root live healthCheck', async () => {
    await expect(controller.root()).resolves.toMatchObject({ status: 'ok' });
    expect(mockHealth.check).toHaveBeenCalled();
  });

  it('live endpoint', async () => {
    await expect(controller.live()).resolves.toMatchObject({ status: 'ok' });
  });

  it('ready endpoint', async () => {
    await expect(controller.ready()).resolves.toMatchObject({ status: 'ok' });
  });
});
