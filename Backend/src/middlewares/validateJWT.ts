import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { decodedJWT } from '../types';

export function validateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.sendStatus(401);
  console.log(authHeader);
  const token = authHeader.split(' ')[1];
  try {
    jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET as string,
      (err, decoded) => {
        if (err) return res.sendStatus(403); // invalid token
        res.locals.user.id = (decoded as decodedJWT).id;
        return next();
      }
    );
  } catch (error) {
    return console.error(error);
  }
}
