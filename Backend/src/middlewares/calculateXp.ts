import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import Log from '../models/log.model';
import { ILog } from '../types';
import { customError } from './errorMiddleware';

const XP_FACTOR_TIME = 5;
const XP_FACTOR_PAGES = 5;
const XP_FACTOR_CHARS = 5;
const XP_FACTOR_EPISODES = 29;

async function calculateXpForLog(log: ILog, req: Request): Promise<ILog> {
  let type = log.type || '';
  if (!type && req.params.id) {
    const foundLog = await Log.findById(req.params.id);
    if (!foundLog) {
      throw new customError('Log not found', 404);
    }
    type = foundLog.type;
  }

  if (!type) {
    throw new customError('Log type not found', 400);
  }

  const timeXp = log.time
    ? Math.floor(((log.time * 45) / 100) * XP_FACTOR_TIME)
    : 0;
  const charsXp = log.chars
    ? Math.floor((log.chars / 350) * XP_FACTOR_CHARS)
    : 0;
  const pagesXp = log.pages ? Math.floor(log.pages * XP_FACTOR_PAGES) : 0;
  const episodesXp = log.episodes
    ? Math.floor(((log.episodes * 45) / 100) * XP_FACTOR_EPISODES)
    : 0;

  switch (type) {
    case 'reading':
    case 'manga':
      log.xp = Math.max(timeXp, charsXp, pagesXp);
      break;
    case 'anime':
      if (timeXp) {
        log.xp = timeXp;
      } else if (episodesXp) {
        log.xp = episodesXp;
      }
      break;
    case 'vn':
      log.xp = Math.max(timeXp, charsXp);
      break;
    case 'video':
    case 'other':
    case 'audio':
      log.xp = timeXp;
      break;
    default:
      throw new customError('Invalid log type', 400);
  }
  return log;
}

export async function calculateXp(
  req: Request<ParamsDictionary, any, ILog | ILog[]>,
  _res: Response,
  next: NextFunction
) {
  try {
    if (Array.isArray(req.body)) {
      const modifiedLogs = await Promise.all(
        req.body.map((log) => calculateXpForLog(log, req))
      );
      req.body = modifiedLogs;
    } else {
      const modifiedLog = await calculateXpForLog(req.body, req);
      req.body = modifiedLog;
    }
    return next();
  } catch (error) {
    return next(error as customError);
  }
}
