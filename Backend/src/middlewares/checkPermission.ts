import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model.js';
import { customError } from './errorMiddleware.js';
import { userRoles } from '../types.js';

export function checkPermission(requiredRole: userRoles) {
  return async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const userFound = await User.findOne({ _id: res.locals.user.id });
      if (!userFound) throw new customError('Unauthorized', 401);

      if (!userFound.roles.includes(requiredRole))
        throw new customError('Unauthorized', 401);
      return next();
    } catch (error) {
      return next(error as customError);
    }
  };
}
