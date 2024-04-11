import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';
import { customError } from './errorMiddleware';

export function checkPermission(requiredRole: 'admin' | 'user' | 'mod') {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const userFound = await User.findOne({ _id: res.locals.user.id });
      if (!userFound) return res.status(401).json({ message: 'Unauthorized' });

      if (userFound.roles.includes(requiredRole)) {
        return next();
      }
    } catch (error) {
      return next(error as customError);
    }
  };
}
