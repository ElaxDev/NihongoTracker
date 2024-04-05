import { NextFunction, Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import Stats from '../models/stats.model';
import User from '../models/user.model';
import { IStats } from '../types';
import { customError } from '../middlewares/errorMiddleware';
import Log from '../models/log.model';

export async function createStat(
  req: Request<ParamsDictionary, any, IStats>,
  res: Response
) {
  const {
    readingXp,
    readingLevel,
    listeningXp,
    listeningLevel,
    charCountVn,
    charCountLn,
    charCountReading,
    pageCountLn,
    readingTimeLn,
    pageCountManga,
    charCountManga,
    readingTimeManga,
    mangaPages,
    listeningTime,
    readingTime,
    animeEpisodes,
    animeWatchingTime,
    videoWatchingTime,
    lnCount,
    readManga,
    watchedAnime,
    playedVn,
  } = req.body;

  const newStats = new Stats({
    readingXp,
    readingLevel,
    listeningXp,
    listeningLevel,
    charCountVn,
    charCountLn,
    charCountReading,
    pageCountLn,
    readingTimeLn,
    pageCountManga,
    charCountManga,
    readingTimeManga,
    mangaPages,
    listeningTime,
    readingTime,
    animeEpisodes,
    animeWatchingTime,
    videoWatchingTime,
    lnCount,
    readManga,
    watchedAnime,
    playedVn,
  });

  const statsSaved = await newStats.save();
  res.json(statsSaved);
}

export async function getUserStats(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) throw new customError('User not found', 404);
    const stats = await Stats.findById(user.statsId);
    if (!stats) {
      throw new customError('Stat document not found for specified user', 404);
    }
    const lastLogs = await Log.find({
      $and: [{ user: user._id }, { updatedAt: { $gt: stats.lastUpdated } }],
    }).sort({ updatedAt: -1 });
    console.log(`${lastLogs}`);
    if (lastLogs.length) {
      res.locals.userStatsId = user.statsId;
      res.locals.lastLogs = lastLogs;
      return next();
    }
    return res.status(200).json(stats);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getStat(req: Request, res: Response) {
  const foundStat = await Stats.findById(req.params.id);
  if (!foundStat) return res.status(404).json({ message: 'Stat not found' });
  return res.json(foundStat);
}

export async function deleteStat(req: Request, res: Response) {
  const deletedStat = await Stats.findByIdAndDelete(req.params.id);
  if (!deletedStat) return res.status(404).json({ message: 'Stat not found' });
  return res.sendStatus(204);
}

export async function updateStatAdmin(req: Request, res: Response) {
  const {
    readingXp,
    readingLevel,
    listeningXp,
    listeningLevel,
    charCountVn,
    charCountLn,
    charCountReading,
    pageCountLn,
    readingTimeLn,
    pageCountManga,
    charCountManga,
    readingTimeManga,
    mangaPages,
    listeningTime,
    readingTime,
    animeEpisodes,
    animeWatchingTime,
    videoWatchingTime,
    lnCount,
    readManga,
    watchedAnime,
    playedVn,
    knownWords,
  } = req.body;

  try {
    const updatedStat = await Stats.findByIdAndUpdate(
      req.params.id,
      {
        readingXp,
        readingLevel,
        listeningXp,
        listeningLevel,
        charCountVn,
        charCountLn,
        charCountReading,
        pageCountLn,
        readingTimeLn,
        pageCountManga,
        charCountManga,
        readingTimeManga,
        mangaPages,
        listeningTime,
        readingTime,
        animeEpisodes,
        animeWatchingTime,
        videoWatchingTime,
        lnCount,
        readManga,
        watchedAnime,
        playedVn,
        knownWords,
      },
      { new: true }
    );
    if (!updatedStat)
      return res.status(404).json({ message: 'Stat not found' });
    return res.json(updatedStat);
  } catch (error) {
    console.error(error);
    return res.status(500);
  }
}
