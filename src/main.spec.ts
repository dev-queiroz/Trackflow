/* eslint-disable @typescript-eslint/no-require-imports */
import { Logger } from '@nestjs/common';

// Mock pino
jest.mock('pino', () => {
  return jest.fn().mockReturnValue({
    info: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  });
});

// Mock pino-http
jest.mock('pino-http', () => {
  return {
    pinoHttp: jest.fn().mockReturnValue((_req: any, _res: any, next: any) => next()),
  };
});

const mockGet = jest.fn();

const mockApp = {
  useLogger: jest.fn(),
  use: jest.fn(),
  useGlobalPipes: jest.fn(),
  enableCors: jest.fn(),
  listen: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockReturnValue({ get: mockGet }),
};

function setupMocks() {
  jest.doMock('pino', () =>
    jest.fn().mockReturnValue({
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  );
  jest.doMock('pino-http', () => ({
    pinoHttp: jest.fn().mockReturnValue((_req: any, _res: any, next: any) => next()),
  }));
  jest.doMock('@nestjs/core', () => ({
    NestFactory: { create: jest.fn().mockResolvedValue(mockApp) },
  }));
  jest.doMock('@nestjs/swagger', () => ({
    DocumentBuilder: jest.fn().mockImplementation(() => ({
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addBearerAuth: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    })),
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
  }));
  jest.doMock('./app.module', () => ({
    AppModule: class MockAppModule {},
  }));
}

function setupErrorMocks(error: Error) {
  jest.doMock('pino', () =>
    jest.fn().mockReturnValue({
      info: jest.fn(),
      debug: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }),
  );
  jest.doMock('pino-http', () => ({
    pinoHttp: jest.fn().mockReturnValue((_req: any, _res: any, next: any) => next()),
  }));
  jest.doMock('@nestjs/core', () => ({
    NestFactory: { create: jest.fn().mockRejectedValue(error) },
  }));
  jest.doMock('@nestjs/swagger', () => ({
    DocumentBuilder: jest.fn().mockImplementation(() => ({
      setTitle: jest.fn().mockReturnThis(),
      setDescription: jest.fn().mockReturnThis(),
      setVersion: jest.fn().mockReturnThis(),
      addBearerAuth: jest.fn().mockReturnThis(),
      build: jest.fn().mockReturnValue({}),
    })),
    SwaggerModule: {
      createDocument: jest.fn().mockReturnValue({}),
      setup: jest.fn(),
    },
  }));
  jest.doMock('./app.module', () => ({
    AppModule: class MockAppModule {},
  }));
}

describe('bootstrap (main.ts)', () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(console, 'error').mockImplementation();
    jest.resetModules();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalEnv;
    jest.restoreAllMocks();
  });

  it('should bootstrap in development mode', async () => {
    process.env.NODE_ENV = 'development';
    mockGet.mockImplementation((key: string) => {
      if (key === 'PORT') return 4000;
      return undefined;
    });
    setupMocks();

    require('./main');
    await new Promise((resolve) => setTimeout(resolve, 100));

    const { NestFactory } = require('@nestjs/core');
    expect(NestFactory.create).toHaveBeenCalled();
    expect(mockApp.useGlobalPipes).toHaveBeenCalled();
    expect(mockApp.enableCors).toHaveBeenCalled();
    expect(mockApp.listen).toHaveBeenCalledWith(4000);
  });

  it('should bootstrap in production mode', async () => {
    process.env.NODE_ENV = 'production';
    mockGet.mockImplementation((key: string) => {
      if (key === 'PORT') return 8080;
      return undefined;
    });
    setupMocks();

    require('./main');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockApp.listen).toHaveBeenCalledWith(8080);
  });

  it('should fallback to port 3000 when PORT is not set', async () => {
    process.env.NODE_ENV = 'development';
    mockGet.mockReturnValue(undefined);
    setupMocks();

    require('./main');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(mockApp.listen).toHaveBeenCalledWith(3000);
  });

  it('should handle pino-pretty error on bootstrap failure', async () => {
    const pinoError = new Error('Cannot find module pino-pretty');
    setupErrorMocks(pinoError);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    require('./main');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(console.error).toHaveBeenCalledWith(
      expect.stringContaining('pino-pretty'),
    );
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });

  it('should handle generic error on bootstrap failure', async () => {
    const genericError = new Error('Something went wrong');
    setupErrorMocks(genericError);

    const mockExit = jest.spyOn(process, 'exit').mockImplementation((() => {}) as any);

    require('./main');
    await new Promise((resolve) => setTimeout(resolve, 100));

    expect(console.error).toHaveBeenCalledWith(
      '❌ Failed to start application:',
      'Something went wrong',
    );
    expect(mockExit).toHaveBeenCalledWith(1);
    mockExit.mockRestore();
  });
});
