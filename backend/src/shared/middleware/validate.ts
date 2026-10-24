import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

/**
 * Generic Zod validation middleware factory.
 * Validates request body, query, and params against the provided schema.
 */
export function validate(schema: AnyZodObject) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      if (validatedData.body !== undefined) {
        req.body = validatedData.body;
      }
      if (validatedData.query !== undefined) {
        try {
          req.query = validatedData.query as any;
        } catch {
          Object.assign(req.query, validatedData.query);
        }
      }
      if (validatedData.params !== undefined) {
        try {
          req.params = validatedData.params as any;
        } catch {
          Object.assign(req.params, validatedData.params);
        }
      }
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: err.errors,
        });
        return;
      }
      next(err);
    }
  };
}
