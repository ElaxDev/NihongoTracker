import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog, IEditedFields } from '../types';
import Log from '../models/log.model';
import User from '../models/user.model';
import { Types } from 'mongoose';
import { customError } from '../middlewares/errorMiddleware';

export async function getUserLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) throw new customError('User not found', 404);
    const logs = await Log.find({ user: user._id }).select('-user');
    return res.json(logs);
  } catch (error) {
    return next(error as customError);
  }
}

export async function createLog(
  req: Request<ParamsDictionary, any, ILog>,
  res: Response,
  next: NextFunction
) {
  const {
    type,
    contentId,
    pages,
    episodes,
    xp,
    description,
    time,
    date,
    chars,
  } = req.body;
  const user: ILog['user'] = res.locals.user.id;
  try {
    const newLog = new Log({
      user,
      type,
      contentId,
      pages,
      episodes,
      xp,
      description,
      time,
      date,
      chars,
    });
    const savedLog = await newLog.save();
    return res.status(200).json(savedLog);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getLog(req: Request, res: Response, next: NextFunction) {
  try {
    const foundLog = await Log.findById(req.params.id).populate('user');
    if (!foundLog) throw new customError('Log not found', 404);
    return res.status(200).json(foundLog);
  } catch (error) {
    return next(error as customError);
  }
}

export async function deleteLog(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedLog = await Log.findByIdAndDelete(
      new Types.ObjectId(req.params.id)
    );
    if (!deletedLog) throw new customError('Log not found', 404);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

export async function updateLog(
  req: Request<ParamsDictionary, any, ILog>,
  res: Response,
  next: NextFunction
) {
  const { description, time, date, xp, contentId, episodes, pages, chars } =
    req.body;

  try {
    const updatedLog = await Log.findByIdAndUpdate(
      req.params.id,
      {
        description,
        time,
        date,
        xp,
        contentId,
        episodes,
        pages,
        chars,
      },
      { new: false }
    );
    if (!updatedLog) throw new customError('Log not found', 404);

    // Define the valid keys of IEditedFields
    const validKeys: (keyof IEditedFields)[] = [
      'episodes',
      'pages',
      'chars',
      'time',
      'xp',
    ];

    const editedFields: IEditedFields = {};

    // Iterate over the properties of req.body and check if they exist in validKeys
    for (const key in req.body) {
      if (
        Object.prototype.hasOwnProperty.call(req.body, key) &&
        validKeys.includes(key as keyof IEditedFields)
      ) {
        // Add the property to editedFields
        editedFields[key as keyof IEditedFields] =
          updatedLog[key as keyof IEditedFields];
      }
    }
    // Assign editedFields to updatedLog
    updatedLog.editedFields = editedFields;

    await updatedLog.save();

    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}
