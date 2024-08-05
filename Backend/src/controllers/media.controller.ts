import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog, IEditedFields } from '../types';
import Anime from '../models/anime.model';
import Manga from '../models/manga.model';
import LightNovel from '../models/lightNovel.model';
import visualNovel from '../models/visualNovel.model';
import { Types } from 'mongoose';
import { customError } from '../middlewares/errorMiddleware';
import updateStats from '../services/updateStats';

export async function getMedia(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foundLog = await Log.findById(req.params.id).populate('user');
    if (!foundLog) throw new customError('Log not found', 404);
    return res.status(200).json(foundLog);
  } catch (error) {
    return next(error as customError);
  }
}

export async function deleteMedia(
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

export async function updateMedia(
  req: Request<ParamsDictionary, any, ILog>,
  res: Response,
  next: NextFunction
) {
  const { description, time, date, contentId, episodes, pages, chars } =
    req.body;

  try {
    const log: ILog | null = await Log.findOne({
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
    await updateStats(res, next);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

async function createMediaFunction(
  logData: ILog,
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
  } = logData;
  const user: ILog['user'] = res.locals.user.id;
  const newLog: ILog | null = new Log({
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
  await updateStats(res, next);
  return savedLog;
}

export async function createMedia(
  req: Request<ParamsDictionary, any, ILog>,
  res: Response,
  next: NextFunction
) {
  const { type, description } = req.body;

  if (!type) throw new customError('Log type is required', 400);
  if (!description) throw new customError('Description is required', 400);

  try {
    const savedLog = await createMediaFunction(req.body, res, next);
    return res.status(200).json(savedLog);
  } catch (error) {
    return next(error as customError);
  }
}
