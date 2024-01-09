import jwt from 'jsonwebtoken';

export async function createAccessToken(tokenData: Object) {
  const privateKey = process.env.ACCESS_TOKEN_SECRET;

  if (!privateKey) {
    throw new Error('Private key is not set');
  }
  try {
    const token = await jwt.sign(tokenData, privateKey, {
      expiresIn: '5m',
    });
    return token;
  } catch (error) {
    return console.error(error);
  }
}

export async function createRefreshToken(tokenData: Object) {
  const privateKey = process.env.REFRESH_TOKEN_SECRET;

  if (!privateKey) {
    throw new Error('Private key is not set');
  }
  try {
    const token = await jwt.sign(tokenData, privateKey, {
      expiresIn: '1d',
    });
    return token;
  } catch (error) {
    return console.error(error);
  }
}
