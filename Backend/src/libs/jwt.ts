import jwt from 'jsonwebtoken';
import { tokenDataType } from '../types';

export async function createAccessToken(tokenData: tokenDataType) {
  const privateKey = process.env.ACCESS_TOKEN_SECRET;

  if (!privateKey) {
    throw new Error('Private key is not set');
  }
  try {
    const token = await jwt.sign(tokenData, privateKey, {
      expiresIn: '2h',
    });
    return token;
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
}

export async function createRefreshToken(
  tokenData: tokenDataType
): Promise<string | undefined> {
  const privateKey = process.env.REFRESH_TOKEN_SECRET;

  if (!privateKey) {
    throw new Error('Private key is not set');
  }
  try {
    const token = await jwt.sign(tokenData, privateKey, {
      expiresIn: '7d',
    });
    return token;
  } catch (error) {
    console.error(error);
    return undefined;
  }
}
