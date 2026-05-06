import { Test } from '@nestjs/testing';
import { AuthModule } from './auth.module';
import { ConfigModule } from '@nestjs/config';

// Mock PrismaService dependencies to avoid real DB connections
jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    connect: jest.fn(),
    end: jest.fn(),
  })),
}));

jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    constructor() {}
    $connect = jest.fn();
    $disconnect = jest.fn();
    user = { findUnique: jest.fn(), create: jest.fn() };
  },
}));

describe('AuthModule', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should be defined', () => {
    expect(AuthModule).toBeDefined();
  });

  it('should compile the module and call useFactory with JWT_EXPIRES_IN set', async () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '2h';

    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
    }).compile();

    expect(module).toBeDefined();
  });

  it('should compile the module and use fallback expiresIn when JWT_EXPIRES_IN is not set', async () => {
    process.env.JWT_SECRET = 'test-secret';
    delete process.env.JWT_EXPIRES_IN;

    const module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true }), AuthModule],
    }).compile();

    expect(module).toBeDefined();
  });
});
