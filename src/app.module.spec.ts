import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({})
      .overrideProvider(ConfigService)
      .useValue({
        get: jest.fn().mockImplementation((key: string) => {
          if (key === 'THROTTLE_TTL_MS') return 60000;
          if (key === 'THROTTLE_LIMIT') return 100;
          if (key === 'JWT_SECRET') return 'test-secret';
          return null;
        }),
      })
      .compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
    expect(module.get(AppModule)).toBeDefined();
  });
});
