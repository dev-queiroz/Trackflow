import { HttpException, HttpStatus, ArgumentsHost } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockArgumentsHost: Partial<ArgumentsHost>;
  let mockResponse: any;
  let mockRequest: any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockRequest = {
      url: '/test-url',
      headers: {},
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
        getRequest: () => mockRequest,
      }),
    };
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  it('should catch HttpException and return correct response', () => {
    const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test error',
        path: '/test-url',
      }),
    );
  });

  it('should catch non-HttpException and return Internal Server Error', () => {
    const exception = new Error('Random error');

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        error: 'Internal Server Error',
        message: 'Internal server error',
      }),
    );
  });

  it('should handle correlationId from request', () => {
    mockRequest.correlationId = 'test-correlation-id';
    const exception = new HttpException('Error', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'test-correlation-id',
      }),
    );
  });

  it('should handle correlationId from request headers', () => {
    mockRequest.headers['x-correlation-id'] = 'header-correlation-id';
    const exception = new HttpException('Error', HttpStatus.FORBIDDEN);

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        correlationId: 'header-correlation-id',
      }),
    );
  });

  it('should handle array message in exception', () => {
    const exceptionResponse = { message: ['error 1', 'error 2'], error: 'Bad Request' };
    const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: ['error 1', 'error 2'],
      }),
    );
  });

  it('should handle primitive message in exception', () => {
    const exception = new HttpException(12345, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: '12345',
      }),
    );
  });

  it('should handle object message in exception', () => {
    const exceptionResponse = { message: { detail: 'something' }, error: 'Bad Request' };
    const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);

    filter.catch(exception, mockArgumentsHost as ArgumentsHost);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: JSON.stringify({ detail: 'something' }),
      }),
    );
  });
});
