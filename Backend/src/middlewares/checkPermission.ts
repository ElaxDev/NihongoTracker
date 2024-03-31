import { Request, Response, NextFunction } from 'express';
import User from '../models/user.model';

export function checkPermission(requiredRole: 'admin' | 'user' | 'mod') {
  return async (_req: Request, res: Response, next: NextFunction) => {
    const userFound = await User.findOne({ _id: res.locals.user.id });
    if (!userFound)
      return res
        .status(401)
        .json({ message: 'Not sufficient permissions, unauthorized' });

    if (userFound.roles.includes(requiredRole)) {
      return next();
    }
  };
}
