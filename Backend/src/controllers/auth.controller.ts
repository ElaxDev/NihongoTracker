import 'dotenv/config';
import { Request, Response } from 'express';
import User from '../models/user.model';
import Stat from '../models/stat.model';
import { createAccessToken, createRefreshToken } from '../libs/jwt';
import jwt from 'jsonwebtoken';

export async function auth(_req: Request, res: Response) {
  const { sub, picture, name, email } = res.locals.user;

  const userFound = await User.findOne({ uuid: sub });
  if (userFound) {
    const accessToken = await createAccessToken({ id: userFound._id });
    if (!accessToken) return res.sendStatus(500); //Internal server error
    const refreshToken = await createRefreshToken({ id: userFound._id });
    if (!refreshToken) return res.sendStatus(500); //Internal server error

    userFound.refreshToken = refreshToken;
    userFound.save();

    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1000,
      sameSite: 'none',
      secure: true,
    });
    return res.json({
      userData: {
        id: userFound._id,
        uuid: userFound.uuid,
        avatar: userFound.avatar,
        username: userFound.username,
        stats: userFound.stats,
        roles: userFound.roles,
        createdAt: userFound.createdAt,
        updatedAt: userFound.updatedAt,
      },
      accessToken,
      newUser: false,
    });
  } else {
    try {
      const newStats = new Stat();
      const statsSaved = await newStats.save();
      const newUser = new User({
        uuid: sub,
        username: name,
        email,
        stats: statsSaved._id,
        avatar: picture,
      });
      const accessToken = await createAccessToken({ id: newUser._id });
      const refreshToken = await createRefreshToken({ id: newUser._id });
      newUser.updateOne({ refreshToken });
      const userSaved = await newUser.save();
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 1000,
        sameSite: 'none',
        secure: true,
      });
      return res.json({
        userData: {
          id: userSaved._id,
          uuid: userSaved.uuid,
          avatar: userSaved.avatar,
          username: userSaved.username,
          stats: userSaved.stats,
          roles: userSaved.roles,
          titles: userSaved.titles,
          createdAt: userSaved.createdAt,
          updatedAt: userSaved.updatedAt,
        },
        accessToken,
        newUser: true,
      });
    } catch (error) {
      return res.status(500).json({ message: (error as Error).message });
    }
  }
}

export async function logout(req: Request, res: Response) {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); //No content
  const refreshToken = cookies.jwt;

  const userFound = await User.findOne({ refreshToken });
  if (!userFound) {
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
    });
    return res.sendStatus(204);
  }

  userFound.refreshToken = '';
  userFound.save();
  res.clearCookie('jwt', {
    httpOnly: true,
    sameSite: 'none',
    secure: true,
  });
  return res.sendStatus(204);
}

export async function refresh(req: Request, res: Response) {
  const cookies = req.cookies;

  if (!cookies?.jwt) return res.sendStatus(401); //Unauthorized
  const refreshToken = cookies.jwt;

  const userFound = await User.findOne({ refreshToken });
  if (!userFound) return res.sendStatus(403); //Forbidden

  const privateKey = process.env.REFRESH_TOKEN_SECRET;
  if (!privateKey) return res.sendStatus(500); //Internal Server Error
  try {
    const decoded = (await jwt.verify(refreshToken, privateKey)) as {
      id: string;
    };

    if (userFound._id.toString() !== decoded.id) {
      return res.sendStatus(403); //Forbidden
    }
    const accessToken = await createAccessToken({ id: userFound._id });
    return res.json({ accessToken });
  } catch (error) {
    console.error(error);
    return res.sendStatus(500); //Internal server error
  }
}
