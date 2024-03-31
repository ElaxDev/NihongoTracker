import { Request, Response } from 'express';

export function register(_req: Request, res: Response) {
  return res.status(200).json({ message: 'OK' });
}

export function login(_req: Request, _res: Response) {
  return;
}
