import { Request, Response, NextFunction } from 'express';

/**
 * Global error handler middleware.
 * Never exposes internal error details to the client.
 */
export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('[Error]', err.message);

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
  }

  // Check for known error types
  if (err.name === 'ZodError') {
    let details: any;
    try {
      details = (err as any).issues || (err as any).errors || JSON.parse(err.message);
    } catch {
      details = err.message;
    }
    res.status(400).json({
      error: 'Validation failed',
      details,
    });
    return;
  }

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  });
}
