import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';
import Log from '../models/log.model';
import User from '../models/user.model';
import { Types } from 'mongoose';

export async function getUserLogs(req: Request, res: Response) {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const logs = await Log.find({ user: user.id }).populate('user');
  return res.json(logs);
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
    return next();
  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Stat could not be created' });
  }
}

export async function getLog(req: Request, res: Response) {
  const foundLog = await Log.findById(req.params.id).populate('user');
  if (!foundLog) return res.status(404).json({ message: 'Log not found' });
  return res.json(foundLog);
}

export async function deleteLog(req: Request, res: Response) {
  const deletedLog = await Log.findByIdAndDelete(
    new Types.ObjectId(req.params.id)
  );
  if (!deletedLog) return res.status(404).json({ message: 'Log not found' });
  return res.sendStatus(204);
}

export async function updateLog(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const {
    type,
    description,
    time,
    date,
    xp,
    contentId,
    episodes,
    pages,
    chars,
  } = req.body;
  const user: ILog['user'] = res.locals.user.id;

  const foundLog = await Log.findById(req.params.id);
  if (!foundLog) return res.status(404).json({ message: 'Log not found' });

  res.locals.prevXP = foundLog.xp;
  res.locals.prevEps = foundLog.episodes;
  res.locals.prevChars = foundLog.chars;
  res.locals.prevPages = foundLog.pages;
  res.locals.prevTime = foundLog.time;

  await foundLog.set({
    user,
    type,
    description,
    time,
    date,
    xp,
    contentId,
    episodes,
    pages,
    chars,
  });

  res.locals.log = await foundLog.save();
  return next();
}
