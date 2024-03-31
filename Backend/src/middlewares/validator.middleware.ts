import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

export function validateSchema<T extends z.ZodTypeAny>(schema: T) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      return next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res
          .status(400)
          .json({ error: error.errors.map((error) => error.message) });
      }
    }
  };
}
