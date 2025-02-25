import { Request, Response, NextFunction } from 'express';
import Media from '../models/media.model';
import { customError } from '../middlewares/errorMiddleware';

export async function getMedia(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const idQuery = req.params.contentId
      ? { contentId: req.params.contentId }
      : {};
    if (idQuery.contentId === undefined)
      return res.status(400).json({ message: 'Invalid query parameters' });
    const media = await Media.findOne(idQuery);
    if (!media) return res.status(404).json({ message: 'Media not found' });
    console.log(media);
    return res.status(200).json(media);
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

    const media = await Media.aggregate([
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
    ]);

    return res.status(200).json(media);
  } catch (error) {
    return next(error as customError);
  }
}
