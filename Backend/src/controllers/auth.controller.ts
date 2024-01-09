import 'dotenv/config';
import { Request, Response } from 'express';
import User from '../models/user.model';
import Stat from '../models/stat.model';
import { createAccessToken, createRefreshToken } from '../libs/jwt';

export async function auth(_req: Request, res: Response) {
  const { sub, picture, name, email } = res.locals.user;

  const userFound = await User.findOne({ uuid: sub });
  if (userFound) {
    const accessToken = await createAccessToken({ id: userFound._id });
    const refreshToken = await createRefreshToken({ id: userFound._id });
    userFound.updateOne({ refreshToken });
    userFound.save();
    res.cookie('jwt', refreshToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 1000,
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

export function logout(_req: Request, res: Response) {
  res.cookie('token', '', {
    expires: new Date(0),
  });
  return res.sendStatus(200);
}

export async function refresh(_req: Request, _res: Response) {
  console.log('refresh');
}
