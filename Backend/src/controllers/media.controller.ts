import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  IAnimeDocument,
  ILightNovelDocument,
  IMangaDocument,
  // IVisualNovelTitle,
  // IVisualNovelDetail
} from '../types';
import Anime from '../models/anime.model';
import Manga from '../models/manga.model';
import LightNovel from '../models/lightNovel.model';
import visualNovel from '../models/vnTitle.model';
import { Types } from 'mongoose';
import { customError } from '../middlewares/errorMiddleware';
import updateStats from '../services/updateStats';

export async function getAnimes(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foundAnime = await Anime.aggregate([
      { $project: { _id: 1, title: 1, synonyms: 1 } },
    ]);
    if (!foundAnime) throw new customError('No anime found', 404);
    return res.status(200).json(foundAnime);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getAnimeById(
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

export async function searchAnime(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    function escapeRegex(text: string) {
      return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    }
    if (!req.query.title) throw new customError('The title is required', 400);
    const regex = new RegExp(escapeRegex(req.query.title as string), 'gi');
    const foundAnime = await Anime.find({
      $or: [{ title: regex }, { synonyms: regex }],
    });
    if (!foundAnime || foundAnime.length === 0)
      throw new customError('Anime not found', 404);
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
    sources,
    type,
    title,
    episodes,
    status,
    animeSeason,
    picture,
    thumbnail,
    duration,
    synonyms,
    relatedAnime,
    tags,
  } = req.body;

  try {
    const anime: IAnimeDocument | null = await Anime.findOne({
      vndbId: Number(req.params.id),
    });

    if (!anime) throw new customError('Anime not found', 404);

    anime.sources = sources !== undefined ? sources : anime.sources;
    anime.type = type !== undefined ? type : anime.type;
    anime.title = title !== undefined ? title : anime.title;
    anime.episodes = episodes !== undefined ? episodes : anime.episodes;
    anime.status = status !== undefined ? status : anime.status;
    anime.animeSeason =
      animeSeason !== undefined ? animeSeason : anime.animeSeason;
    anime.picture = picture !== undefined ? picture : anime.picture;
    anime.thumbnail = thumbnail !== undefined ? thumbnail : anime.thumbnail;
    anime.duration = duration !== undefined ? duration : anime.duration;
    anime.synonyms = synonyms !== undefined ? synonyms : anime.synonyms;
    anime.relatedAnime =
      relatedAnime !== undefined ? relatedAnime : anime.relatedAnime;
    anime.tags = tags !== undefined ? tags : anime.tags;

    const updatedAnime = await anime.save();
    await updateStats(res, next);
    return res.sendStatus(200).json(updatedAnime);
  } catch (error) {
    return next(error as customError);
  }
}

async function createAnimeFunction(animeDetails: IAnimeDocument) {
  const {
    sources,
    type,
    title,
    episodes,
    status,
    animeSeason,
    picture,
    thumbnail,
    duration,
    synonyms,
    relatedAnime,
    tags,
  } = animeDetails;
  const newAnime: IAnimeDocument | null = new Anime({
    sources,
    type,
    title,
    episodes,
    status,
    animeSeason,
    picture,
    thumbnail,
    duration,
    synonyms,
    relatedAnime,
    tags,
  });
  const savedAnime = await newAnime.save();
  return savedAnime;
}

export async function createAnime(
  req: Request<ParamsDictionary, any, IAnimeDocument>,
  res: Response,
  next: NextFunction
) {
  const { type, title, episodes, status, animeSeason } = req.body;

  if (!title) throw new customError('The title is required', 400);
  if (!type) throw new customError('The type is required', 400);
  if (!status) throw new customError('The status is required', 400);
  if (!animeSeason.year) throw new customError('The status is required', 400);
  if (!episodes) throw new customError('The episode count is required', 400);

  try {
    const savedAnime = await createAnimeFunction(req.body);
    return res.sendStatus(200).json(savedAnime);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getMangaById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foundManga = await Manga.findById(req.query.id);
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
    title,
    anilistId,
    description,
    genres,
    chapters,
    volumes,
    anilistScore,
    adult,
    status,
    approximatedCharCount,
    approximatedReadingTime,
    coverImage,
    startDate,
    endDate,
  } = req.body;

  try {
    const manga: IMangaDocument | null = await Manga.findOne({
      vndbId: Number(req.params.id),
    });

    if (!manga) throw new customError('Manga not found', 404);

    manga.anilistId = anilistId !== undefined ? anilistId : manga.anilistId;
    manga.description =
      description !== undefined ? description : manga.description;
    manga.genres = genres !== undefined ? genres : manga.genres;
    manga.title = title !== undefined ? title : manga.title;
    manga.chapters = chapters !== undefined ? chapters : manga.chapters;
    manga.volumes = volumes !== undefined ? volumes : manga.volumes;
    manga.anilistScore =
      anilistScore !== undefined ? anilistScore : manga.anilistScore;
    manga.adult = adult !== undefined ? adult : manga.adult;
    manga.status = status !== undefined ? status : manga.status;
    manga.approximatedCharCount =
      approximatedCharCount !== undefined
        ? approximatedCharCount
        : manga.approximatedCharCount;
    manga.approximatedReadingTime =
      approximatedReadingTime !== undefined
        ? approximatedReadingTime
        : manga.approximatedReadingTime;
    manga.coverImage = coverImage !== undefined ? coverImage : manga.coverImage;
    manga.startDate = startDate !== undefined ? startDate : manga.startDate;
    manga.endDate = endDate !== undefined ? endDate : manga.endDate;

    const updatedManga = await manga.save();
    await updateStats(res, next);
    return res.sendStatus(200).json(updatedManga);
  } catch (error) {
    return next(error as customError);
  }
}

async function createMangaFunction(mangaDetails: IMangaDocument) {
  const {
    title,
    anilistId,
    description,
    genres,
    chapters,
    volumes,
    anilistScore,
    adult,
    status,
    approximatedCharCount,
    approximatedReadingTime,
    coverImage,
    startDate,
    endDate,
  } = mangaDetails;
  const newManga: IMangaDocument | null = new Manga({
    title,
    anilistId,
    description,
    genres,
    chapters,
    volumes,
    anilistScore,
    adult,
    status,
    approximatedCharCount,
    approximatedReadingTime,
    coverImage,
    startDate,
    endDate,
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
    const savedManga = await createMangaFunction(req.body);
    return res.sendStatus(200).json(savedManga);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getLightNovelById(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const foundLightNovel = await LightNovel.findById(req.query.id);
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
    title,
    anilistId,
    description,
    author,
    genres,
    anilistScore,
    startDate,
    endDate,
    adult,
    coverImage,
    approximatedCharCount,
    approximatedReadingTime,
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
    lightNovel.author = author !== undefined ? author : lightNovel.author;
    lightNovel.genres = genres !== undefined ? genres : lightNovel.genres;
    lightNovel.anilistScore =
      anilistScore !== undefined ? anilistScore : lightNovel.anilistScore;
    lightNovel.startDate =
      startDate !== undefined ? startDate : lightNovel.startDate;
    lightNovel.endDate = endDate !== undefined ? endDate : lightNovel.endDate;
    lightNovel.adult = adult !== undefined ? adult : lightNovel.adult;
    lightNovel.coverImage =
      coverImage !== undefined ? coverImage : lightNovel.coverImage;
    lightNovel.approximatedCharCount =
      approximatedCharCount !== undefined
        ? approximatedCharCount
        : lightNovel.approximatedCharCount;
    lightNovel.approximatedReadingTime =
      approximatedReadingTime !== undefined
        ? approximatedReadingTime
        : lightNovel.approximatedReadingTime;
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
  lightNovelDetails: ILightNovelDocument
) {
  const {
    title,
    anilistId,
    description,
    author,
    genres,
    anilistScore,
    startDate,
    endDate,
    adult,
    coverImage,
    approximatedCharCount,
    approximatedReadingTime,
    startedUserCount,
    readingUserCount,
    finishedUserCount,
  } = lightNovelDetails;
  const newLightNovel: ILightNovelDocument | null = new LightNovel({
    title,
    anilistId,
    description,
    author,
    genres,
    anilistScore,
    startDate,
    endDate,
    adult,
    coverImage,
    approximatedCharCount,
    approximatedReadingTime,
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
  const { anilistId, title, coverImage } = req.body;

  if (!anilistId) throw new customError('The Anilist ID is required', 400);
  if (!title) throw new customError('The title is required', 400);
  if (!coverImage) throw new customError('The cover image is required', 400);

  try {
    const savedLightNovel = await createLightNovelFunction(req.body);
    return res.sendStatus(200).json(savedLightNovel);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getVisualNovelById(
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

export async function searchVisualNovel(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const titleSearch = req.query.title as string;
    if (!titleSearch) throw new customError('Search term is required', 400);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const foundVisualNovel = await visualNovel.aggregate([
      {
        $match: {
          $text: { $search: titleSearch },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          latin: 1,
          alias: 1,
          id: 1,
          score: { $meta: 'textScore' },
        },
      },
      {
        $sort: { score: { $meta: 'textScore' } },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    if (!foundVisualNovel) throw new customError('Visual Novel not found', 404);
    return res.status(200).json(foundVisualNovel);
  } catch (error) {
    return next(error as customError);
  }
}
