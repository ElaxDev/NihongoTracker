import User from '../models/user.model';
import { Request, Response, NextFunction } from 'express';
import generateToken from '../libs/jwt';
import { ILogin, IRegister } from '../types';
import { customError } from '../middlewares/errorMiddleware';

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, password, passwordConfirmation }: IRegister = req.body;
  try {
    const userExists = await User.findOne({ username: username });

    if (userExists) {
      throw new customError('An user with that username already exists!', 400);
    }

    if (password !== passwordConfirmation) {
      throw new customError('Passwords do not match!', 400);
    }

    const user = await User.create({ username, password });

    if (!user) throw new customError('Invalid user data', 400);

    generateToken(res, user._id.toString());
    return res.status(201).json({
      _id: user._id,
      name: user.username,
      stats: user.stats,
      avatar: user.avatar,
      titles: user.titles,
      roles: user.roles,
    });
  } catch (error) {
    return next(error as customError);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  const { username, password }: ILogin = req.body;
  try {
    if (!username || !password)
      throw new customError('Please provide username and password', 400);

    const user = await User.findOne({ username: username });

    if (user && (await user.matchPassword(password))) {
      generateToken(res, user._id.toString());
      return res.status(201).json({
        _id: user._id,
        name: user.username,
        stats: user.stats,
        avatar: user.avatar,
        titles: user.titles,
        roles: user.roles,
      });
    } else {
      throw new customError('Incorrect username or password', 401);
    }
  } catch (error) {
    return next(error as customError);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('jwt', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({ message: 'User logged out' });
}
