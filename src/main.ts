import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import pino from 'pino';
import { pinoHttp } from 'pino-http';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';

  const pinoInstance = pino({
    level: isProduction ? 'info' : 'debug',
    // Ajuste aqui: verificamos se não é produção para carregar o transport
    transport: !isProduction
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'HH:MM:ss Z',
            ignore: 'pid,hostname', // Opcional: limpa o log
          },
        }
      : undefined,
  });

  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // Middleware para logs de requisição HTTP
  app.use(pinoHttp({ logger: pinoInstance }));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT') || 3000;

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('TrackFlow API')
    .setDescription('Event Ingestion and Analytics Service')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(port);

  const startupLogger = new Logger('Bootstrap');
  startupLogger.log(`🚀 TrackFlow API running on: http://localhost:${port}`);
  startupLogger.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
}

bootstrap().catch((error: Error) => {
  // Verificação extra para o erro de transporte
  if (error.message.includes('pino-pretty')) {
    console.error(
      '❌ Erro: pino-pretty não encontrado. Execute: npm install pino-pretty --save-dev',
    );
  } else {
    console.error('❌ Failed to start application:', error.message);
  }
  process.exit(1);
});
