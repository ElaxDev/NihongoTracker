import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  IAnimeDocument,
  ILightNovelDocument,
  IMangaDocument,
  IVisualNovelDocument,
} from '../types';
import Anime from '../models/anime.model';
import Manga from '../models/manga.model';
import LightNovel from '../models/lightNovel.model';
import visualNovel from '../models/visualNovel.model';
import { Types } from 'mongoose';
import { customError } from '../middlewares/errorMiddleware';
import updateStats from '../services/updateStats';

export async function getAnime(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foundAnime = await Anime.findById(req.params.id);
    if (!foundAnime) throw new customError('Anime not found', 404);
    return res.status(200).json(foundAnime);
  } catch (error) {
    return next(error as customError);
  }
}

export async function deleteAnime(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedAnime = await Anime.findByIdAndDelete(
      new Types.ObjectId(req.params.id)
    );
    if (!deletedAnime) throw new customError('Anime not found', 404);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

export async function updateAnime(
  req: Request<ParamsDictionary, any, IAnimeDocument>,
  res: Response,
  next: NextFunction
) {
  const {
    anilistId,
    title,
    description,
    episodes,
    anilistScore,
    adult,
    episodeDuration,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    watchingUserCount,
    finishedUserCount,
  } = req.body;

  try {
    const anime: IAnimeDocument | null = await Anime.findOne({
      vndbId: Number(req.params.id),
    });

    if (!anime) throw new customError('Anime not found', 404);

    anime.anilistId = anilistId !== undefined ? anilistId : anime.anilistId;
    anime.description =
      description !== undefined ? description : anime.description;
    anime.title = title !== undefined ? title : anime.title;
    anime.episodes = episodes !== undefined ? episodes : anime.episodes;
    anime.anilistScore =
      anilistScore !== undefined ? anilistScore : anime.anilistScore;
    anime.adult = adult !== undefined ? adult : anime.adult;
    anime.episodeDuration =
      episodeDuration !== undefined ? episodeDuration : anime.episodeDuration;
    anime.coverImageLarge =
      coverImageLarge !== undefined ? coverImageLarge : anime.coverImageLarge;
    anime.releaseYear =
      releaseYear !== undefined ? releaseYear : anime.releaseYear;
    anime.genres = genres !== undefined ? genres : anime.genres;
    anime.startedUserCount =
      startedUserCount !== undefined
        ? startedUserCount
        : anime.startedUserCount;
    anime.watchingUserCount =
      watchingUserCount !== undefined
        ? watchingUserCount
        : anime.watchingUserCount;
    anime.finishedUserCount =
      finishedUserCount !== undefined
        ? finishedUserCount
        : anime.finishedUserCount;

    const updatedAnime = await anime.save();
    await updateStats(res, next);
    return res.sendStatus(200).json(updatedAnime);
  } catch (error) {
    return next(error as customError);
  }
}

async function createAnimeFunction(animeDetails: IAnimeDocument) {
  const {
    anilistId,
    title,
    description,
    episodes,
    anilistScore,
    adult,
    episodeDuration,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    watchingUserCount,
    finishedUserCount,
  } = animeDetails;
  const newAnime: IAnimeDocument | null = new Anime({
    anilistId,
    title,
    description,
    episodes,
    anilistScore,
    adult,
    episodeDuration,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    watchingUserCount,
    finishedUserCount,
  });
  const savedAnime = await newAnime.save();
  return savedAnime;
}

export async function createAnime(
  req: Request<ParamsDictionary, any, IAnimeDocument>,
  res: Response,
  next: NextFunction
) {
  const { anilistId, title, episodes } = req.body;

  if (!anilistId) throw new customError('The Anilist ID is required', 400);
  if (!title) throw new customError('The title is required', 400);
  if (!episodes) throw new customError('The episode count is required', 400);

  try {
    const savedAnime = await createAnimeFunction(req.body);
    return res.sendStatus(200).json(savedAnime);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getManga(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foundManga = await Manga.findById(req.params.id);
    if (!foundManga) throw new customError('Requested manga not found', 404);
    return res.status(200).json(foundManga);
  } catch (error) {
    return next(error as customError);
  }
}

export async function deleteManga(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedManga = await Manga.findByIdAndDelete(
      new Types.ObjectId(req.params.id)
    );
    if (!deletedManga) throw new customError('Requested manga not found', 404);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

export async function updateManga(
  req: Request<ParamsDictionary, any, IMangaDocument>,
  res: Response,
  next: NextFunction
) {
  const {
    anilistId,
    title,
    description,
    chapters,
    volumes,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    readingUserCount,
    finishedUserCount,
  } = req.body;

  try {
    const manga: IMangaDocument | null = await Manga.findOne({
      vndbId: Number(req.params.id),
    });

    if (!manga) throw new customError('Manga not found', 404);

    manga.anilistId = anilistId !== undefined ? anilistId : manga.anilistId;
    manga.description =
      description !== undefined ? description : manga.description;
    manga.title = title !== undefined ? title : manga.title;
    manga.chapters = chapters !== undefined ? chapters : manga.chapters;
    manga.volumes = volumes !== undefined ? volumes : manga.volumes;
    manga.anilistScore =
      anilistScore !== undefined ? anilistScore : manga.anilistScore;
    manga.adult = adult !== undefined ? adult : manga.adult;
    manga.coverImageLarge =
      coverImageLarge !== undefined ? coverImageLarge : manga.coverImageLarge;
    manga.releaseYear =
      releaseYear !== undefined ? releaseYear : manga.releaseYear;
    manga.genres = genres !== undefined ? genres : manga.genres;
    manga.startedUserCount =
      startedUserCount !== undefined
        ? startedUserCount
        : manga.startedUserCount;
    manga.readingUserCount =
      readingUserCount !== undefined
        ? readingUserCount
        : manga.readingUserCount;
    manga.finishedUserCount =
      finishedUserCount !== undefined
        ? finishedUserCount
        : manga.finishedUserCount;

    const updatedManga = await manga.save();
    await updateStats(res, next);
    return res.sendStatus(200).json(updatedManga);
  } catch (error) {
    return next(error as customError);
  }
}

async function createMangaFunction(
  mangaDetails: IMangaDocument,
  res: Response,
  next: NextFunction
) {
  const {
    anilistId,
    title,
    description,
    chapters,
    volumes,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    readingUserCount,
    finishedUserCount,
  } = mangaDetails;
  const newManga: IMangaDocument | null = new Manga({
    anilistId,
    title,
    description,
    chapters,
    volumes,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    readingUserCount,
    finishedUserCount,
  });
  const savedManga = await newManga.save();
  return savedManga;
}

export async function createManga(
  req: Request<ParamsDictionary, any, IMangaDocument>,
  res: Response,
  next: NextFunction
) {
  const { anilistId, title, chapters, volumes } = req.body;

  if (!anilistId) throw new customError('The Anilist ID is required', 400);
  if (!title) throw new customError('The title is required', 400);
  if (!chapters) throw new customError('The chapter count is required', 400);
  if (!volumes) throw new customError('The volume count is required', 400);

  try {
    const savedManga = await createMangaFunction(req.body, res, next);
    return res.sendStatus(200).json(savedManga);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getLightNovel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foundLightNovel = await LightNovel.findById(req.params.id);
    if (!foundLightNovel) throw new customError('Light Novel not found', 404);
    return res.status(200).json(foundLightNovel);
  } catch (error) {
    return next(error as customError);
  }
}

export async function deleteLightNovel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedLightNovel = await LightNovel.findByIdAndDelete(
      new Types.ObjectId(req.params.id)
    );
    if (!deletedLightNovel) throw new customError('Light Novel not found', 404);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

export async function updateLightNovel(
  req: Request<ParamsDictionary, any, ILightNovelDocument>,
  res: Response,
  next: NextFunction
) {
  const {
    anilistId,
    title,
    description,
    volumes,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    readingUserCount,
    finishedUserCount,
  } = req.body;

  try {
    const lightNovel: ILightNovelDocument | null = await LightNovel.findOne({
      vndbId: Number(req.params.id),
    });

    if (!lightNovel) throw new customError('Light Novel not found', 404);

    lightNovel.anilistId =
      anilistId !== undefined ? anilistId : lightNovel.anilistId;
    lightNovel.description =
      description !== undefined ? description : lightNovel.description;
    lightNovel.title = title !== undefined ? title : lightNovel.title;
    lightNovel.volumes = volumes !== undefined ? volumes : lightNovel.volumes;
    lightNovel.anilistScore =
      anilistScore !== undefined ? anilistScore : lightNovel.anilistScore;
    lightNovel.adult = adult !== undefined ? adult : lightNovel.adult;
    lightNovel.coverImageLarge =
      coverImageLarge !== undefined
        ? coverImageLarge
        : lightNovel.coverImageLarge;
    lightNovel.releaseYear =
      releaseYear !== undefined ? releaseYear : lightNovel.releaseYear;
    lightNovel.genres = genres !== undefined ? genres : lightNovel.genres;
    lightNovel.startedUserCount =
      startedUserCount !== undefined
        ? startedUserCount
        : lightNovel.startedUserCount;
    lightNovel.readingUserCount =
      readingUserCount !== undefined
        ? readingUserCount
        : lightNovel.readingUserCount;
    lightNovel.finishedUserCount =
      finishedUserCount !== undefined
        ? finishedUserCount
        : lightNovel.finishedUserCount;

    const updatedLightNovel = await lightNovel.save();
    await updateStats(res, next);
    return res.sendStatus(200).json(updatedLightNovel);
  } catch (error) {
    return next(error as customError);
  }
}

async function createLightNovelFunction(
  lightNovelDetails: ILightNovelDocument,
  res: Response,
  next: NextFunction
) {
  const {
    anilistId,
    title,
    description,
    volumes,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    readingUserCount,
    finishedUserCount,
  } = lightNovelDetails;
  const newLightNovel: ILightNovelDocument | null = new LightNovel({
    anilistId,
    title,
    description,
    volumes,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    readingUserCount,
    finishedUserCount,
  });
  const savedLightNovel = await newLightNovel.save();
  return savedLightNovel;
}

export async function createLightNovel(
  req: Request<ParamsDictionary, any, ILightNovelDocument>,
  res: Response,
  next: NextFunction
) {
  const { anilistId, title, volumes } = req.body;

  if (!anilistId) throw new customError('The Anilist ID is required', 400);
  if (!title) throw new customError('The title is required', 400);
  if (!volumes) throw new customError('The volume count is required', 400);

  try {
    const savedLightNovel = await createLightNovelFunction(req.body, res, next);
    return res.sendStatus(200).json(savedLightNovel);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getVisualNovel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foundVisualNovel = await visualNovel.findById(req.params.id);
    if (!foundVisualNovel) throw new customError('Visual Novel not found', 404);
    return res.status(200).json(foundVisualNovel);
  } catch (error) {
    return next(error as customError);
  }
}

export async function deleteVisualNovel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedVisualNovel = await visualNovel.findByIdAndDelete(
      new Types.ObjectId(req.params.id)
    );
    if (!deletedVisualNovel)
      throw new customError('Visual Novel not found', 404);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

export async function updateVisualNovel(
  req: Request<ParamsDictionary, any, IVisualNovelDocument>,
  res: Response,
  next: NextFunction
) {
  const {
    anilistId,
    title,
    description,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    playingUserCount,
    finishedUserCount,
  } = req.body;

  try {
    const visualNovel: IVisualNovelDocument | null = await visualNovel.findOne({
      vndbId: Number(req.params.id),
    });

    if (!visualNovel) throw new customError('Visual Novel not found', 404);

    visualNovel.anilistId =
      anilistId !== undefined ? anilistId : visualNovel.anilistId;
    visualNovel.description =
      description !== undefined ? description : visualNovel.description;
    visualNovel.title = title !== undefined ? title : visualNovel.title;
    visualNovel.anilistScore =
      anilistScore !== undefined ? anilistScore : visualNovel.anilistScore;
    visualNovel.adult = adult !== undefined ? adult : visualNovel.adult;
    visualNovel.coverImageLarge =
      coverImageLarge !== undefined
        ? coverImageLarge
        : visualNovel.coverImageLarge;
    visualNovel.releaseYear =
      releaseYear !== undefined ? releaseYear : visualNovel.releaseYear;
    visualNovel.genres = genres !== undefined ? genres : visualNovel.genres;
    visualNovel.startedUserCount =
      startedUserCount !== undefined
        ? startedUserCount
        : visualNovel.startedUserCount;
    visualNovel.playingUserCount =
      playingUserCount !== undefined
        ? playingUserCount
        : visualNovel.playingUserCount;
    visualNovel.finishedUserCount =
      finishedUserCount !== undefined
        ? finishedUserCount
        : visualNovel.finishedUserCount;

    const updatedVisualNovel = await visualNovel.save();
    await updateStats(res, next);
    return res.sendStatus(200).json(updatedVisualNovel);
  } catch (error) {
    return next(error as customError);
  }
}

async function createVisualNovelFunction(
  visualNovelDetails: IVisualNovelDocument,
  res: Response,
  next: NextFunction
) {
  const {
    anilistId,
    title,
    description,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    playingUserCount,
    finishedUserCount,
  } = visualNovelDetails;
  const newVisualNovel: IVisualNovelDocument | null = new visualNovel({
    anilistId,
    title,
    description,
    anilistScore,
    adult,
    coverImageLarge,
    releaseYear,
    genres,
    startedUserCount,
    playingUserCount,
    finishedUserCount,
  });
  const savedVisualNovel = await newVisualNovel.save();
  return savedVisualNovel;
}

export async function createVisualNovel(
  req: Request<ParamsDictionary, any, IVisualNovelDocument>,
  res: Response,
  next: NextFunction
) {
  const { anilistId, title } = req.body;

  if (!anilistId) throw new customError('The Anilist ID is required', 400);
  if (!title) throw new customError('The title is required', 400);

  try {
    const savedVisualNovel = await createVisualNovelFunction(
      req.body,
      res,
      next
    );
    return res.sendStatus(200).json(savedVisualNovel);
  } catch (error) {
    return next(error as customError);
  }
}
