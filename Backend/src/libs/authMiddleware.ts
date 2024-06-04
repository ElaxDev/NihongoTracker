import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import { Request, Response, NextFunction } from 'express';
import { customError } from '../middlewares/errorMiddleware';
import { decodedJWT } from '../types';

export async function protect(req: Request, res: Response, next: NextFunction) {
  let token;
  const privateKey = process.env.TOKEN_SECRET;

  try {
    token = req.cookies.jwt;
    if (!privateKey) {
      throw new customError('Private key is not set', 500);
    }
    if (token) {
      try {
        const decoded = jwt.verify(token, privateKey);
        res.locals.user = await User.findById(
          (decoded as decodedJWT).id
        ).select('-password');
        return next();
      } catch (error) {
        throw error as customError;
      }
    } else {
      throw new customError('Unauthorized, no token', 401);
    }
  } catch (error) {
    return next(error as customError);
  }
}
