import User from '../models/user.model';
import { Request, Response, NextFunction } from 'express';
import { updateRequest } from '../types';
import { customError } from '../middlewares/errorMiddleware';

export async function updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, avatar, newPassword, newPasswordConfirm, password } =
    req.body as updateRequest;

  try {
    const user = await User.findById(res.locals.user._id);
    if (!user) {
      throw new customError('User not found', 404);
    }

    if (newPassword || password || newPasswordConfirm) {
      if (!password) {
        throw new customError('Old password is required', 400);
      }
      if (!newPassword) {
        throw new customError('New password is required', 400);
      }
      if (!newPasswordConfirm) {
        throw new customError('You need to confirm the new password', 400);
      }
      if (newPassword !== newPasswordConfirm) {
        throw new customError('Passwords do not match', 403);
      }
      if (!(await user.matchPassword(password))) {
        throw new customError('Incorrect password', 401);
      }

      user.password = newPassword;
    }

    if (username) user.username = username;
    user.avatar = avatar;

    const updatedUser = await user.save();

    return res.json(updatedUser);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getUser(req: Request, res: Response) {
  const userFound = await User.findOne({
    username: req.params.username,
  }).populate('stats');
  if (!userFound) return res.status(404).json({ message: 'User not found' });

  return res.json({
    id: userFound._id,
    username: userFound.username,
    statsId: userFound.statsId,
    avatar: userFound.avatar,
    titles: userFound.titles,
    createdAt: userFound.createdAt,
    updatedAt: userFound.updatedAt,
  });
}
