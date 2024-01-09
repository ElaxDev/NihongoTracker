import { Request, Response } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import Stat from '../models/stat.model';
import User from '../models/user.model';
import { IStat } from '../types';

export async function createStat(
  req: Request<ParamsDictionary, any, IStat>,
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
    knownWords,
  } = req.body;

  const newStats = new Stat({
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
  });

  const statsSaved = await newStats.save();
  res.json(statsSaved);
}

export async function getUserStats(req: Request, res: Response) {
  const user = await User.findOne({ username: req.params.username });
  if (!user) return res.status(404).json({ message: 'User not found' });
  const stats = await Stat.findById(user.stats);
  if (!stats)
    return res
      .status(404)
      .json({ message: 'Stat document not found for specified user' });
  return res.json(stats);
}

export async function getStat(req: Request, res: Response) {
  const foundStat = await Stat.findById(req.params.id);
  if (!foundStat) return res.status(404).json({ message: 'Stat not found' });
  return res.json(foundStat);
}

export async function deleteStat(req: Request, res: Response) {
  const deletedStat = await Stat.findByIdAndDelete(req.params.id);
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
    const updatedStat = await Stat.findByIdAndUpdate(
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
