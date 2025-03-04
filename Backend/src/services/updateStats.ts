import { Response, NextFunction } from 'express';
import { IEditedFields, ILog, IStats, IUser } from '../types';
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
    console.time('updateStats');
    const user: IUser | null = await User.findById(res.locals.user.id);
    if (!user || !user.stats) {
      throw new customError('User does not have stats', 404);
    }
    let type: string,
      xp: number,
      editedFields: IEditedFields | null | undefined;
    let log: ILog | null;
    const userStats = user.stats;
    if (res.locals.importedStats) {
      type = 'imported';
      xp =
        res.locals.importedStats.listeningXp +
        res.locals.importedStats.readingXp;
      log = null;
    } else {
      log = res.locals.log as ILog;
      type = log.type;
      xp = log.xp;
      editedFields = log.editedFields;
    }

    // Update XP fields
    const xpUpdate = updateField(xp, editedFields?.xp);
    userStats.userXp += xpUpdate;

    switch (type) {
      case 'anime':
      case 'video':
      case 'audio':
        userStats.listeningXp += xpUpdate;
        break;
      case 'manga':
      case 'reading':
      case 'vn':
        userStats.readingXp += xpUpdate;
        break;
      case 'other':
        break;
      case 'imported':
        userStats.listeningXp += res.locals.importedStats.listeningXp;
        userStats.readingXp += res.locals.importedStats.readingXp;
        break;
      default:
        throw new customError('Invalid content type', 400);
    }

    if (log) {
      log.editedFields = null;
      await log.save();
    }

    // Update levels and XP
    updateLevelAndXp(userStats, 'listening');
    updateLevelAndXp(userStats, 'reading');
    updateLevelAndXp(userStats, 'user');

    user.markModified('stats');
    await user.save();

    console.timeEnd('updateStats');
    return userStats as IStats;
  } catch (error) {
    return next(error as customError);
  }
}
