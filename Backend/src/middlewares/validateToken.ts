import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const { token } = req.cookies;
  if (!token)
    return res.status(401).json({ message: 'No token, unauthorized' });

  const privateKey = process.env.JWT_SECRET_KEY;
  if (!privateKey) throw new Error('Private key is not set');

  try {
    jwt.verify(token, privateKey, {}, (err, user) => {
      if (err) return res.status(403).json({ message: 'invalid token' });

      res.locals.user = user;

      return next();
    });
  } catch (error) {
    return console.error(error);
  }
}
