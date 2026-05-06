import {
  INestApplication,
  ValidationPipe,
  RequestMethod,
} from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

/** Rotas fora de `/v1` — probes e documentação */
const GLOBAL_PREFIX_EXCLUDES = [
  { path: 'health', method: RequestMethod.ALL },
  { path: 'health/live', method: RequestMethod.ALL },
  { path: 'health/ready', method: RequestMethod.ALL },
  { path: 'docs', method: RequestMethod.ALL },
  { path: 'docs/(.*)', method: RequestMethod.ALL },
];

export function configureNestApp(app: INestApplication): void {
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.setGlobalPrefix('v1', { exclude: GLOBAL_PREFIX_EXCLUDES });

  app.enableCors({
    origin: process.env.CORS_ORIGIN?.split(',').map((s) => s.trim()) ?? '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'x-correlation-id'],
    exposedHeaders: ['x-correlation-id'],
  });

  const config = new DocumentBuilder()
    .setTitle('TrackFlow API')
    .setDescription('Event ingestion and analytics (REST API v1)')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'bearer',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
}
