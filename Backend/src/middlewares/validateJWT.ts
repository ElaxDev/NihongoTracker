import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { decodedJWT } from '../types';

export async function validateJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);
  const token: string = authHeader.split(' ')[1];
  try {
    const decoded = await jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string
    );
    res.locals.user = {};
    res.locals.user.id = (decoded as decodedJWT).id;
    return next();
  } catch (error) {
    if (error) {
      return res.sendStatus(403); // invalid token
    }
  }
}
