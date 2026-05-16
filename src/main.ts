import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { configureNestApp } from './bootstrap/configure-nest-app';
import pino from 'pino';
import { pinoHttp } from 'pino-http';
import helmet from 'helmet';
import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

import { correlationMiddleware } from './common/middleware/correlation.middleware';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const pinoInstance = pino({
    level: isProduction ? 'info' : 'debug',
    transport: !isProduction
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  app.use(helmet());

  app.use(
    pinoHttp({
      logger: pinoInstance,
      genReqId: (req) => {
        const incoming = req.headers['x-correlation-id'];
        const id =
          typeof incoming === 'string' && incoming.length > 0
            ? incoming
            : uuidv4();
        (req as { id?: string }).id = id;
        return id;
      },
    }),
  );

  app.use(correlationMiddleware);

  configureNestApp(app);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') ?? 3000;

  await app.listen(port);

  const startupLogger = new Logger('Bootstrap');
  startupLogger.log(`Tracked API - http://localhost:${port}/v1`);
  startupLogger.log(`OpenAPI - http://localhost:${port}/docs`);
}

bootstrap().catch((error: Error) => {
  if (error.message.includes('pino-pretty')) {
    console.error(
      'Error: pino-pretty not found. Run: npm install pino-pretty --save-dev',
    );
  } else {
    console.error('Failed to start application:', error.message);
  }
  process.exit(1);
});
