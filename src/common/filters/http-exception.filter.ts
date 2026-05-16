import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { STATUS_CODES } from 'node:http';
import { Request, Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  private normalizeMessage(messageRaw: unknown): string | string[] {
    if (Array.isArray(messageRaw)) {
      return messageRaw;
    }

    if (
      typeof messageRaw === 'string' ||
      typeof messageRaw === 'number' ||
      typeof messageRaw === 'boolean' ||
      typeof messageRaw === 'bigint' ||
      typeof messageRaw === 'symbol' ||
      messageRaw === null ||
      messageRaw === undefined
    ) {
      return String(messageRaw);
    }

    return JSON.stringify(messageRaw);
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<
      Request & { id?: string; correlationId?: string }
    >();

    const correlationId =
      request.correlationId ??
      (typeof request.id === 'string' ? request.id : undefined) ??
      (request.headers['x-correlation-id'] as string | undefined);

    const timestamp = new Date().toISOString();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const resBody = exception.getResponse();
      const bodyObj =
        typeof resBody === 'object' && resBody !== null
          ? (resBody as Record<string, unknown>)
          : { message: resBody };

      const messageRaw: unknown = bodyObj.message ?? exception.message;
      const message = this.normalizeMessage(messageRaw);

      response.status(status).json({
        statusCode: status,
        error:
          (typeof bodyObj.error === 'string' ? bodyObj.error : null) ??
          STATUS_CODES[status] ??
          'Error',
        message,
        path: request.url,
        correlationId: correlationId ?? null,
        timestamp,
      });
      return;
    }

    const message =
      exception instanceof Error ? exception.message : 'Internal server error';
    this.logger.error(
      message,
      exception instanceof Error ? exception.stack : '',
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      message: 'Internal server error',
      path: request.url,
      correlationId: correlationId ?? null,
      timestamp,
    });
  }
}
