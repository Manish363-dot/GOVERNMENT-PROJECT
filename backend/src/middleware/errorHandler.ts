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
    res.status(400).json({
      error: 'Validation failed',
      details: JSON.parse(err.message),
    });
    return;
  }

  res.status(500).json({
    error: 'An unexpected error occurred. Please try again later.',
  });
}
