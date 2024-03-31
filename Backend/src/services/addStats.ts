import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { IUser, ILog } from '../types';
import { calculateLevel } from './calculateLevel';
import User from '../models/user.model';
import Stat from '../models/stat.model';

export default async function AddOrUpdateStats(
  req: Request<ParamsDictionary, any, ILog>,
  res: Response
) {
  const { type, contentId, episodes, xp, time, chars, pages } = req.body;
  const previousXP = res.locals.prevXP ? res.locals.prevXP : 0;
  const previousEpisodes = res.locals.prevEps ? res.locals.prevEps : 0;
  const previousChars = res.locals.prevChars ? res.locals.prevChars : 0;
  const previousPages = res.locals.prevPages ? res.locals.prevPages : 0;
  const previousTime = res.locals.prevTime ? res.locals.prevTime : 0;
  const user = (await User.findById(res.locals.user.id)) as IUser;
  const userStats = await Stat.findById(user.stats);
  if (!userStats)
    return res
      .status(404)
      .json({ message: 'User does not have a stat document' });
  switch (type) {
    case 'anime':
      userStats.listeningXp += xp - previousXP;
      if (episodes)
        userStats.listeningTime += episodes * 24 - previousEpisodes * 24;
      if (episodes)
        userStats.animeWatchingTime += episodes * 24 - previousEpisodes * 24;
      if (episodes) userStats.animeEpisodes += episodes - previousEpisodes;
      if (contentId && !userStats.watchedAnime.includes(contentId))
        userStats.watchedAnime.push(contentId);
      break;
    case 'video':
      userStats.listeningXp += xp - previousXP;
      if (time) userStats.listeningTime += time - previousTime;
      if (time) userStats.videoWatchingTime += time - previousTime;
      break;
    case 'ln':
      userStats.readingXp += xp - previousXP;
      if (time) userStats.readingTime += time - previousTime;
      if (time) userStats.readingTimeLn += time - previousTime;
      if (chars) userStats.charCountLn += chars - previousChars;
      if (pages) userStats.pageCountLn += pages - previousPages;
      break;
    case 'manga':
      userStats.readingXp += xp - previousXP;
      if (pages) userStats.mangaPages += pages - previousPages;
      if (chars) userStats.charCountManga += chars - previousChars;
      if (time) userStats.readingTime += time - previousTime;
      if (time) userStats.readingTimeManga += time - previousTime;
      if (contentId && !userStats.readManga.includes(contentId))
        userStats.readManga.push(contentId);
      break;
    case 'reading':
      userStats.readingXp += xp - previousXP;
      if (time) userStats.readingTime += time - previousTime;
      if (chars) userStats.charCountReading += chars - previousChars;
      break;
    case 'vn':
      userStats.readingXp += xp - previousXP;
      if (time) userStats.readingTime += time - previousTime;
      if (chars) userStats.charCountVn += chars - previousChars;
      if (contentId && !userStats.playedVn.includes(contentId))
        userStats.playedVn.push(contentId);
      break;
    default:
      return res.status(400).json({ message: 'Invalid content type' });
  }
  const listeningLevelXp = calculateLevel(userStats.listeningLevel);
  if (userStats.listeningXp > listeningLevelXp) {
    userStats.listeningLevel += 1;
  }
  const readingLevelXp = calculateLevel(userStats.readingLevel);
  if (userStats.readingXp > readingLevelXp) {
    userStats.readingLevel += 1;
  }
  userStats.save();
  return res.json(res.locals.log);
}
