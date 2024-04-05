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
    for (const log of lastLogs) {
      switch (log.type) {
        case 'anime':
          if (log.editedFields && log.editedFields.xp) {
            userStats.listeningXp += log.xp - log.editedFields.xp;
          } else if (log.xp) {
            userStats.listeningXp += log.xp;
          }

          if (log.editedFields && log.editedFields.episodes) {
            userStats.listeningTime +=
              log.episodes! * 24 - log.editedFields.episodes * 24;
            userStats.animeWatchingTime +=
              log.episodes! * 24 - log.editedFields.episodes * 24;
            userStats.animeEpisodes +=
              log.episodes! - log.editedFields.episodes;
          } else if (log.episodes) {
            userStats.listeningTime += log.episodes * 24;
            userStats.animeWatchingTime += log.episodes * 24;
            userStats.animeEpisodes += log.episodes;
          }
          break;
        case 'video':
          if (log.editedFields && log.editedFields.xp) {
            userStats.listeningXp += log.xp - log.editedFields.xp;
          } else if (log.xp) {
            userStats.listeningXp += log.xp;
          }

          if (log.editedFields && log.editedFields.time) {
            userStats.listeningTime += log.time! - log.editedFields.time;
            userStats.videoWatchingTime += log.time! - log.editedFields.time;
          } else if (log.time) {
            userStats.listeningTime += log.time;
            userStats.videoWatchingTime += log.time;
          }
          break;
        case 'ln':
          if (log.editedFields && log.editedFields.xp) {
            userStats.readingXp += log.xp - log.editedFields.xp;
          } else if (log.xp) {
            userStats.readingXp += log.xp;
          }

          if (log.editedFields && log.editedFields.time) {
            userStats.readingTime += log.time! - log.editedFields.time;
            userStats.readingTimeLn += log.time! - log.editedFields.time;
          } else if (log.time) {
            userStats.readingTime += log.time;
            userStats.readingTimeLn += log.time;
          }

          if (log.editedFields && log.editedFields.chars) {
            userStats.charCountLn += log.chars! - log.editedFields.chars;
          } else if (log.chars) {
            userStats.charCountLn += log.chars;
          }

          if (log.editedFields && log.editedFields.pages) {
            userStats.pageCountLn += log.pages! - log.editedFields.pages;
          } else if (log.pages) {
            userStats.pageCountLn += log.pages;
          }
          break;
        case 'manga':
          if (log.editedFields && log.editedFields.xp) {
            userStats.readingXp += log.xp - log.editedFields.xp;
          } else if (log.xp) {
            userStats.readingXp += log.xp;
          }

          if (log.editedFields && log.editedFields.pages) {
            userStats.mangaPages += log.pages! - log.editedFields.pages;
          } else if (log.pages) {
            userStats.mangaPages += log.pages;
          }

          if (log.editedFields && log.editedFields.chars) {
            userStats.charCountManga += log.chars! - log.editedFields.chars;
          } else if (log.chars) {
            userStats.charCountManga += log.chars;
          }

          if (log.editedFields && log.editedFields.time) {
            userStats.readingTime += log.time! - log.editedFields.time;
            userStats.readingTimeManga += log.time! - log.editedFields.time;
          } else if (log.time) {
            userStats.readingTime += log.time;
            userStats.readingTimeManga += log.time;
          }
          break;
        case 'reading':
          if (log.editedFields && log.editedFields.xp) {
            userStats.readingXp += log.xp - log.editedFields.xp;
          } else if (log.xp) {
            userStats.readingXp += log.xp;
          }

          if (log.editedFields && log.editedFields.time) {
            userStats.readingTime += log.time! - log.editedFields.time;
            userStats.readingTime += log.time! - log.editedFields.time;
          } else if (log.time) {
            userStats.readingTime += log.time;
            userStats.readingTime += log.time;
          }

          if (log.editedFields && log.editedFields.chars) {
            userStats.charCountReading += log.chars! - log.editedFields.chars;
          } else if (log.chars) {
            userStats.charCountReading += log.chars;
          }
          break;
        case 'vn':
        case 'vn':
          if (log.editedFields && log.editedFields.xp) {
            userStats.readingXp += log.xp - log.editedFields.xp;
          } else if (log.xp) {
            userStats.readingXp += log.xp;
          }

          if (log.editedFields && log.editedFields.time) {
            userStats.readingTime += log.time! - log.editedFields.time;
            userStats.readingTimeVn += log.time! - log.editedFields.time;
          } else if (log.time) {
            userStats.readingTime += log.time;
            userStats.readingTimeVn += log.time;
          }

          if (log.editedFields && log.editedFields.chars) {
            userStats.charCountVn += log.chars! - log.editedFields.chars;
          } else if (log.chars) {
            userStats.charCountVn += log.chars;
          }
          break;
        default:
          return res.status(400).json({ message: 'Invalid content type' });
      }

      while (userStats.listeningXp > calculateLevel(userStats.listeningLevel)) {
        userStats.listeningLevel += 1;
      }

      while (userStats.readingXp > calculateLevel(userStats.readingLevel)) {
        userStats.readingLevel += 1;
      }

      // Reset the editedFields property
      log.editedFields = null;
      await log.save();
    }
    await userStats.save();
    return res.status(200).json(userStats).end();
  } catch (error) {
    return next(error as customError);
  }
}
