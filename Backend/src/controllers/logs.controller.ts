import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog, IEditedFields } from '../types';
import Log from '../models/log.model';
import { Types } from 'mongoose';
import { customError } from '../middlewares/errorMiddleware';
import updateStats from '../services/updateStats';

export async function getUserLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;
  try {
    const logs = await Log.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: {
          'user.username': req.params.username,
        },
      },
      {
        $project: {
          user: 0,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    if (!logs.length) throw new customError('User not found', 404);

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
    res.locals.log = savedLog;
    updateStats(req, res, next);
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
  const { description, time, date, contentId, episodes, pages, chars } =
    req.body;

  try {
    const log = await Log.findOne({
      _id: new Types.ObjectId(req.params.id),
      user: res.locals.user.id,
    });

    if (!log) throw new customError('Log not found', 404);

    const validKeys: (keyof IEditedFields)[] = [
      'episodes',
      'pages',
      'chars',
      'time',
      'xp',
    ];

    const editedFields: IEditedFields = {};

    for (const key in req.body) {
      if (validKeys.includes(key as keyof IEditedFields)) {
        editedFields[key as keyof IEditedFields] =
          log[key as keyof IEditedFields];
      }
    }

    log.description = description !== undefined ? description : log.description;
    log.time = time !== undefined ? time : log.time;
    log.date = date !== undefined ? date : log.date;
    log.contentId = contentId !== undefined ? contentId : log.contentId;
    log.episodes = episodes !== undefined ? episodes : log.episodes;
    log.pages = pages !== undefined ? pages : log.pages;
    log.chars = chars !== undefined ? chars : log.chars;
    log.editedFields = editedFields;

    const updatedLog = await log.save();
    res.locals.log = updatedLog;
    await updateStats(req, res, next);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}
