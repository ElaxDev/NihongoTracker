import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { ILog } from '../types';
import { calculateLevel } from './calculateLevel';
import Stats from '../models/stats.model';
import { customError } from '../middlewares/errorMiddleware';

export default async function updateStats(
  _req: Request<ParamsDictionary, any, ILog>,
  res: Response,
  next: NextFunction
) {
  try {
    const userStats = await Stats.findById(res.locals.userStatsId);
    const lastLogs: Array<ILog> = res.locals.lastLogs;
    if (!userStats) {
      throw new customError('User does not have a stat document', 404);
    }

    const promises = lastLogs.map(async (log) => {
      const { type, xp, editedFields, episodes, time, chars, pages } = log;

      switch (type) {
        case 'anime':
          userStats.listeningXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.userXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.listeningTime +=
            (episodes || 0) * 24 - (editedFields?.episodes || 0) * 24 || 0;
          userStats.animeWatchingTime +=
            (episodes || 0) * 24 - (editedFields?.episodes || 0) * 24 || 0;
          userStats.animeEpisodes +=
            (episodes || 0) - (editedFields?.episodes || 0);
          break;
        case 'video':
          userStats.listeningXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.userXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.listeningTime += (time || 0) - (editedFields?.time || 0);
          userStats.videoWatchingTime +=
            (time || 0) - (editedFields?.time || 0);
          break;
        case 'ln':
          userStats.readingXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.userXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.readingTime += (time || 0) - (editedFields?.time || 0);
          userStats.readingTimeLn += (time || 0) - (editedFields?.time || 0);
          userStats.charCountLn += (chars || 0) - (editedFields?.chars || 0);
          userStats.pageCountLn += (pages || 0) - (editedFields?.pages || 0);
          break;
        case 'manga':
          userStats.readingXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.userXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.mangaPages += (pages || 0) - (editedFields?.pages || 0);
          userStats.charCountManga += (chars || 0) - (editedFields?.chars || 0);
          userStats.readingTime += (time || 0) - (editedFields?.time || 0);
          userStats.readingTimeManga += (time || 0) - (editedFields?.time || 0);
          break;
        case 'reading':
          userStats.readingXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.userXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.readingTime += (time || 0) - (editedFields?.time || 0);
          userStats.charCountReading +=
            (chars || 0) - (editedFields?.chars || 0);
          break;
        case 'vn':
          userStats.readingXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.userXp += (xp || 0) - (editedFields?.xp || 0);
          userStats.readingTime += (time || 0) - (editedFields?.time || 0);
          userStats.readingTimeVn += (time || 0) - (editedFields?.time || 0);
          userStats.charCountVn += (chars || 0) - (editedFields?.chars || 0);
          break;
        default:
          return res.status(400).json({ message: 'Invalid content type' });
      }

      log.editedFields = null;
      return await log.save();
    });

    await Promise.all(promises);

    userStats.listeningLevel = calculateLevel(userStats.listeningXp);
    userStats.readingLevel = calculateLevel(userStats.readingXp);
    userStats.userLevel = calculateLevel(userStats.userXp);

    await userStats.save();

    return res.status(200).json(userStats).end();
  } catch (error) {
    return next(error as customError);
  }
}
