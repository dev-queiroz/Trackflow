import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { configureNestApp } from './configure-nest-app';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';

describe('configureNestApp', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({}).compile();
    app = moduleFixture.createNestApplication();
  });

  it('should configure the application correctly', () => {
    const useGlobalFiltersSpy = jest.spyOn(app, 'useGlobalFilters');
    const useGlobalPipesSpy = jest.spyOn(app, 'useGlobalPipes');
    const setGlobalPrefixSpy = jest.spyOn(app, 'setGlobalPrefix');
    const enableCorsSpy = jest.spyOn(app, 'enableCors');

    configureNestApp(app);

    expect(useGlobalFiltersSpy).toHaveBeenCalledWith(expect.any(HttpExceptionFilter));
    expect(useGlobalPipesSpy).toHaveBeenCalledWith(expect.any(ValidationPipe));
    expect(setGlobalPrefixSpy).toHaveBeenCalledWith('v1', expect.any(Object));
    expect(enableCorsSpy).toHaveBeenCalled();
  });

  it('should handle CORS_ORIGIN environment variable', () => {
    process.env.CORS_ORIGIN = 'http://example.com,http://test.com';
    const enableCorsSpy = jest.spyOn(app, 'enableCors');

    configureNestApp(app);

    expect(enableCorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: ['http://example.com', 'http://test.com'],
      }),
    );

    delete process.env.CORS_ORIGIN;
  });

  it('should use default CORS origin when CORS_ORIGIN is not set', () => {
    delete process.env.CORS_ORIGIN;
    const enableCorsSpy = jest.spyOn(app, 'enableCors');

    configureNestApp(app);

    expect(enableCorsSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: '*',
      }),
    );
  });
});
