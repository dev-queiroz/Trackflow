import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';

export function correlationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const incoming = req.headers['x-correlation-id'];
  const id =
    (typeof (req as Request & { id?: string }).id === 'string'
      ? (req as Request & { id?: string }).id
      : undefined) ??
    (typeof incoming === 'string' ? incoming : undefined) ??
    uuidv4();

  (req as Request & { id?: string; correlationId?: string }).id = id;
  (req as Request & { correlationId?: string }).correlationId = id;
  res.setHeader('x-correlation-id', id);
  next();
}
