import { Response, NextFunction } from 'express';
import { ILog, IStats, IUser } from '../types';
import { calculateLevel, calculateXp } from './calculateLevel';
import { customError } from '../middlewares/errorMiddleware';
import User from '../models/user.model';

function updateField(
  newValue: number | undefined,
  oldValue: number | undefined
): number {
  return (newValue || 0) - (oldValue || 0);
}

function updateLevelAndXp(userStats: any, field: string) {
  userStats[`${field}Level`] = calculateLevel(userStats[`${field}Xp`]);
  userStats[`${field}XpToNextLevel`] = calculateXp(
    userStats[`${field}Level`] + 1
  );
  userStats[`${field}XpToCurrentLevel`] = calculateXp(
    userStats[`${field}Level`]
  );
}

export default async function updateStats(
  res: Response,
  next: NextFunction
): Promise<void | IStats> {
  try {
    const user: IUser | null = await User.findById(res.locals.user.id);
    if (!user || !user.stats) {
      throw new customError('User does not have stats', 404);
    }

    const userStats = user.stats;
    const log = res.locals.log as ILog;
    const { type, xp, editedFields, episodes, time, chars, pages } = log;

    // Update XP fields
    const xpUpdate = updateField(xp, editedFields?.xp);
    userStats.userXp += xpUpdate;

    switch (type) {
      case 'anime':
        userStats.listeningXp += xpUpdate;
        userStats.listeningTime += time
          ? updateField(time, editedFields?.time)
          : updateField(episodes, editedFields?.episodes) * 24;
        userStats.animeWatchingTime += time
          ? updateField(time, editedFields?.time)
          : updateField(episodes, editedFields?.episodes) * 24;
        userStats.animeEpisodes += updateField(
          episodes,
          editedFields?.episodes
        );
        break;
      case 'video':
        userStats.listeningXp += xpUpdate;
        userStats.listeningTime += updateField(time, editedFields?.time);
        userStats.videoWatchingTime += updateField(time, editedFields?.time);
        break;
      case 'manga':
        userStats.readingXp += xpUpdate;
        userStats.mangaPages += updateField(pages, editedFields?.pages);
        userStats.charCountManga += updateField(chars, editedFields?.chars);
        userStats.readingTime += updateField(time, editedFields?.time);
        userStats.readingTimeManga += updateField(time, editedFields?.time);
        break;
      case 'reading':
        userStats.readingXp += xpUpdate;
        userStats.readingTime += updateField(time, editedFields?.time);
        userStats.charCountReading += updateField(chars, editedFields?.chars);
        userStats.pageCountReading += updateField(pages, editedFields?.pages);
        break;
      case 'vn':
        userStats.readingXp += xpUpdate;
        userStats.readingTime += updateField(time, editedFields?.time);
        userStats.readingTimeVn += updateField(time, editedFields?.time);
        userStats.charCountVn += updateField(chars, editedFields?.chars);
        break;
      case 'audio':
        userStats.listeningXp += xpUpdate;
        userStats.listeningTime += updateField(time, editedFields?.time);
        userStats.audioListeningTime += updateField(time, editedFields?.time);
        break;
      case 'other':
        break;
      default:
        throw new customError('Invalid content type', 400);
    }

    log.editedFields = null;
    await log.save();

    // Update levels and XP
    updateLevelAndXp(userStats, 'listening');
    updateLevelAndXp(userStats, 'reading');
    updateLevelAndXp(userStats, 'user');

    user.markModified('stats');
    await user.save();

    return userStats as IStats;
  } catch (error) {
    return next(error as customError);
  }
}
