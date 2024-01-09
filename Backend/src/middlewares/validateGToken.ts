import { OAuth2Client } from 'google-auth-library';
import { IRequest } from '../types';
import { Response, NextFunction } from 'express';

const client = new OAuth2Client(process.env.CLIENT_ID);

export default async function validateGToken(
  req: IRequest<{ jwtToken: string; clientId: string }>,
  res: Response,
  next: NextFunction
) {
  try {
    const ticket = await client.verifyIdToken({
      idToken: req.body.jwtToken,
      audience: req.body.clientId,
    });
    const userData = ticket.getPayload();
    res.locals.user = userData;
    next();
  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: 'Unauthorized, unable to verify token',
    });
  }
}
