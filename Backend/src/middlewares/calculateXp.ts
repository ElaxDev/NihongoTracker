import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import Log from '../models/log.model';
import { ILog } from '../types';
import { customError } from './errorMiddleware';

export async function calculateXp(
  req: Request<ParamsDictionary, any, ILog>,
  res: Response,
  next: NextFunction
) {
  const { episodes, pages, time, chars } = req.body;
  let type;
  try {
    if (req.body.type) {
      type = req.body.type;
    } else if (req.params.id) {
      const foundLog = await Log.findById(req.params.id);
      if (!foundLog) {
        throw new customError('Log not found', 404);
      }
      type = foundLog.type;
    } else {
      throw new customError('Log type not found', 400);
    }
    var timeXp = 0;
    var charsXp = 0;
    var pagesXp = 0;
    switch (type) {
      case 'reading':
        timeXp = 0;
        charsXp = 0;
        if (time) timeXp = Math.floor(((time * 45) / 100) * 5);
        if (chars) charsXp = Math.floor((chars / 350) * 5);
        req.body.xp = Math.max(timeXp, charsXp);
        return next();

      case 'anime':
        if (episodes) req.body.xp = Math.floor(((episodes * 45) / 100) * 29);
        return next();

      case 'video':
        if (time) req.body.xp = Math.floor(((time * 45) / 100) * 5);
        return next();

      case 'vn':
        timeXp = 0;
        charsXp = 0;
        if (time) timeXp = Math.floor(((time * 45) / 100) * 5);
        if (chars) charsXp = Math.floor((chars / 350) * 5);
        req.body.xp = Math.max(timeXp, charsXp);
        return next();

      case 'ln':
        timeXp = 0;
        charsXp = 0;
        pagesXp = 0;
        if (time) timeXp = Math.floor(((time * 45) / 100) * 5);
        if (chars) charsXp = Math.floor((chars / 350) * 5);
        if (pages) pagesXp = Math.floor(pages * 5);
        req.body.xp = Math.max(timeXp, charsXp, pagesXp);
        return next();

      case 'manga':
        timeXp = 0;
        charsXp = 0;
        pagesXp = 0;
        if (time) timeXp = Math.floor(((time * 45) / 100) * 5);
        if (chars) charsXp = Math.floor((chars / 350) * 5);
        if (pages) pagesXp = Math.floor(pages * 5);
        req.body.xp = Math.max(timeXp, charsXp, pagesXp);
        return next();

      default:
        return res.status(400).json({ error: 'Invalid log type' });
    }
  } catch (error) {
    return next(error as customError);
  }
}
