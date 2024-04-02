import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { customError } from '../middlewares/errorMiddleware';

export default function generateToken(res: Response, userId: string) {
  const privateKey = process.env.TOKEN_SECRET;

  if (!privateKey) {
    throw new customError('Private key is not set', 500);
  }
  try {
    const token = jwt.sign({ userId }, privateKey, {
      expiresIn: '30d',
    });
    res.cookie('jwt', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
  } catch (error) {
    throw error as customError;
  }
}
