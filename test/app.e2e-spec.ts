import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureNestApp } from '../src/bootstrap/configure-nest-app';
import { PrismaService } from '../src/prisma/prisma.service';

describe('TrackFlow API (e2e)', () => {
  let app: INestApplication<App>;

  const mockPrisma = {
    $connect: jest.fn().mockResolvedValue(undefined),
    $disconnect: jest.fn().mockResolvedValue(undefined),
    $queryRaw: jest.fn().mockResolvedValue([{ '?column?': 1 }]),
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    event: {
      count: jest.fn().mockResolvedValue(0),
      groupBy: jest.fn().mockResolvedValue([]),
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    app = moduleFixture.createNestApplication();
    configureNestApp(app);
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /health/live — disponível fora do prefixo /v1', async () => {
    const res = await request(app.getHttpServer()).get('/health/live');
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ status: 'ok' });
  });

  it('GET /v1/analytics/events/count sem Bearer — 401', async () => {
    await request(app.getHttpServer())
      .get('/v1/analytics/events/count')
      .expect(401);
  });
});
