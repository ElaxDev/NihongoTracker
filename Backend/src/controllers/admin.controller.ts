import User from '../models/user.model';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../types';
import { customError } from '../middlewares/errorMiddleware';

export async function deleteUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedUser = await User.findByIdAndDelete(req.params.id);
    if (!deletedUser) throw new customError('User not found', 404);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

export async function updateUserById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { username, statsId, avatar, titles, clubs } = req.body as IUser;
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        username,
        statsId,
        clubs,
        avatar,
        titles,
      },
      { new: true }
    );
    if (!updatedUser) throw new customError('User not found', 404);
    return res.json(updatedUser);
  } catch (error) {
    return next(error as customError);
  }
}
