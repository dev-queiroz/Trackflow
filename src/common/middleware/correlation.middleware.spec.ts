import { correlationMiddleware } from './correlation.middleware';
import * as uuid from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn().mockReturnValue('test-uuid'),
}));

describe('correlationMiddleware', () => {
  let req: any;
  let res: any;
  let next: any;

  beforeEach(() => {
    req = { headers: {} };
    res = { setHeader: jest.fn() };
    next = jest.fn();
    jest.clearAllMocks();
  });

  it('should use existing request id', () => {
    req.id = 'existing-id';
    correlationMiddleware(req, res, next);
    expect(req.correlationId).toBe('existing-id');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'existing-id');
    expect(next).toHaveBeenCalled();
  });

  it('should use x-correlation-id header if present', () => {
    req.headers['x-correlation-id'] = 'header-id';
    correlationMiddleware(req, res, next);
    expect(req.correlationId).toBe('header-id');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'header-id');
    expect(next).toHaveBeenCalled();
  });

  it('should generate new id if none present', () => {
    correlationMiddleware(req, res, next);
    expect(req.correlationId).toBe('test-uuid');
    expect(res.setHeader).toHaveBeenCalledWith('x-correlation-id', 'test-uuid');
    expect(next).toHaveBeenCalled();
  });
});
