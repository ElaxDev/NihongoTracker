import { Request, Response, NextFunction } from 'express';
import { Anime, Manga, MediaBase, Reading } from '../models/media.model.js';
import { customError } from '../middlewares/errorMiddleware.js';
import fac from 'fast-average-color-node';
import { searchAnilist } from '../services/searchAnilist.js';
import { PipelineStage } from 'mongoose';
import { IMediaDocument } from '../types.js';
import axios from 'axios';

export async function getAverageColor(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { imageUrl } = req.query as { imageUrl: string };
    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    const color = await fac.getAverageColor(imageUrl, {
      algorithm: 'simple',
      mode: 'speed',
      width: 50,
      height: 50,
    });

    return res.status(200).json(color);
  } catch (error) {
    return next(error as customError);
  }
}

const LinkTypeObject = {
  // "Web": 1,
  vn: 2, //VNDB
  // "Tmdb": 3,
  anime: 4, // Anilist
  manga: 4, // Anilist
  reading: 4, // Anilist
  // "GoogleBooks": 6,
  // "Imdb": 7,
  // "Igdb": 8,
  // "Syosetsu": 9
};

interface IJitenDeck {
  deckId: number;
  creationDate: Date;
  coverName: string;
  mediaType: number;
  originalTitle: string;
  romajiTitle: string;
  englishTitle: string;
  characterCount: number;
  wordCount: number;
  uniqueWordCount: number;
  uniqueWordUsedOnceCount: number;
  uniqueKanjiCount: number;
  uniqueKanjiUsedOnceCount: number;
  difficulty: number;
  difficultyRaw: number;
  sentenceCount: number;
  averageSentenceLength: number;
  parentDeckId: number | null;
  links: Array<{
    linkId: number;
    linkType: number;
    url: string;
  }>;
  childrenDeckCount: number;
  selectedWordOcurrences: number;
  dialoguePercentage: number;
}

interface IJitenResponse {
  data: {
    parentDeck: IJitenDeck;
    mainDeck: IJitenDeck;
    subDecks: IJitenDeck[];
  };
  totalItems: number;
  pageSize: number;
  currentOffset: number;
}

export async function getMedia(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const mediaQuery =
      req.params.contentId && req.params.mediaType
        ? { contentId: req.params.contentId, type: req.params.mediaType }
        : req.params.contentId
          ? { contentId: req.params.contentId }
          : {};

    if (mediaQuery.contentId === undefined)
      return res.status(400).json({ message: 'Invalid query parameters' });

    const jitenURL = process.env.JITEN_API_URL;
    let jitenResponse = null;

    if (jitenURL && mediaQuery.type) {
      try {
        const LinkType: number | null = mediaQuery.type
          ? LinkTypeObject[mediaQuery.type as keyof typeof LinkTypeObject] ??
            null
          : null;

        if (LinkType) {
          const jitenDeck = await axios.get(
            `${jitenURL}/media-deck/by-link-id/${LinkType}/${mediaQuery.contentId}`,
            {
              validateStatus: (status) => status === 200 || status === 404,
            }
          );

          if (
            jitenDeck.status === 200 &&
            jitenDeck.data &&
            jitenDeck.data.length > 0
          ) {
            const jitenDetailResponse = await axios.get(
              `${jitenURL}/media-deck/${jitenDeck.data[0]}/detail`,
              {
                validateStatus: (status) => status === 200 || status === 404,
              }
            );

            if (jitenDetailResponse.status === 200) {
              jitenResponse = jitenDetailResponse.data as IJitenResponse;
            }
          }
        }
      } catch (jitenError) {
        console.warn('Jiten API error:', jitenError);
        // Continue without Jiten data
      }
    }

    const media = await MediaBase.findOne(mediaQuery);
    if (
      !media &&
      mediaQuery.type &&
      (mediaQuery.type === 'anime' ||
        mediaQuery.type === 'manga' ||
        mediaQuery.type === 'reading')
    ) {
      const mediaAnilist = await searchAnilist({
        ids: [parseInt(mediaQuery.contentId)],
      });
      if (mediaAnilist.length > 0) {
        if (mediaQuery.type === 'anime') {
          await Anime.insertMany(mediaAnilist, {
            ordered: false,
          });
        } else if (mediaQuery.type === 'manga') {
          await Manga.insertMany(mediaAnilist, {
            ordered: false,
          });
        } else if (mediaQuery.type === 'reading') {
          await Reading.insertMany(mediaAnilist, {
            ordered: false,
          });
        }
        return res.status(200).json({
          ...mediaAnilist[0].toObject(),
          jiten: jitenResponse ? jitenResponse.data : null,
        });
      } else {
        return res.status(404).json({ message: 'Media not found' });
      }
    }
    if (!media) return res.status(404).json({ message: 'Media not found' });
    return res.status(200).json({
      ...media.toObject(),
      jiten: jitenResponse ? jitenResponse.data : null,
    });
  } catch (error) {
    return next(error as customError);
  }
}

export async function searchMedia(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const title = req.query.search as string;
    const type = req.query.type as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.perPage as string) || 10;
    const skip = (page - 1) * limit;

    if (!title || !type)
      return res.status(400).json({ message: 'Invalid query parameters' });

    const searchAggregation: PipelineStage[] = [
      {
        $match: {
          $text: { $search: title },
          type: type,
        },
      },
      {
        $addFields: {
          score: { $meta: 'textScore' },
        },
      },
      {
        $sort: {
          score: -1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ];

    const media: IMediaDocument[] =
      await MediaBase.aggregate(searchAggregation);

    return res.status(200).json(media);
  } catch (error) {
    return next(error as customError);
  }
}
