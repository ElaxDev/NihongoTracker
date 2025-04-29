import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import Media from '../models/media.model.js';
import { ILog, IEditedFields, ICreateLog, IMediaDocument } from '../types.js';
import Log from '../models/log.model.js';
import User from '../models/user.model.js';
import { ObjectId, PipelineStage, Types } from 'mongoose';
import { customError } from '../middlewares/errorMiddleware.js';
import updateStats from '../services/updateStats.js';
import { searchAnilist } from '../services/searchAnilist.js';

export async function getUserLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const page =
    req.query.page != undefined && parseInt(req.query.page as string) >= 0
      ? parseInt(req.query.page as string)
      : 1;
  const limit =
    req.query.limit != undefined && parseInt(req.query.limit as string) >= 0
      ? parseInt(req.query.limit as string)
      : 10;
  const skip = (page - 1) * limit;

  try {
    let pipeline: PipelineStage[] = [
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $match: {
          'user.username': req.params.username,
        },
      },
      {
        $project: {
          user: 0,
          editedFields: 0,
        },
      },
      {
        $skip: skip,
      },
    ];

    if (limit > 0) {
      pipeline.push({
        $limit: limit,
      });
    }

    const logs = await Log.aggregate(pipeline, {
      collation: { locale: 'en', strength: 2 },
    });

    if (!logs.length) return res.status(204);

    return res.status(200).json(logs);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getLog(req: Request, res: Response, next: NextFunction) {
  try {
    const foundLog = await Log.findById(req.params.id).populate('user');
    if (!foundLog) throw new customError('Log not found', 404);
    return res.status(200).json(foundLog);
  } catch (error) {
    return next(error as customError);
  }
}

export async function deleteLog(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const deletedLog = await Log.findByIdAndDelete(
      new Types.ObjectId(req.params.id)
    );
    if (!deletedLog) throw new customError('Log not found', 404);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

export async function updateLog(
  req: Request<ParamsDictionary, any, ILog>,
  res: Response,
  next: NextFunction
) {
  const { description, time, date, mediaId, episodes, pages, chars } = req.body;

  try {
    const log: ILog | null = await Log.findOne({
      _id: new Types.ObjectId(req.params.id),
      user: res.locals.user.id,
    });

    if (!log) throw new customError('Log not found', 404);

    const validKeys: (keyof IEditedFields)[] = [
      'episodes',
      'pages',
      'chars',
      'time',
      'xp',
    ];

    const editedFields: IEditedFields = {};

    for (const key in req.body) {
      if (validKeys.includes(key as keyof IEditedFields)) {
        editedFields[key as keyof IEditedFields] =
          log[key as keyof IEditedFields];
      }
    }

    log.description = description !== undefined ? description : log.description;
    log.time = time !== undefined ? time : log.time;
    log.date = date !== undefined ? date : log.date;
    log.mediaId = mediaId !== undefined ? mediaId : log.mediaId;
    log.episodes = episodes !== undefined ? episodes : log.episodes;
    log.pages = pages !== undefined ? pages : log.pages;
    log.chars = chars !== undefined ? chars : log.chars;
    log.editedFields = editedFields;

    const updatedLog = await log.save();
    res.locals.log = updatedLog;
    await updateStats(res, next);
    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

async function createLogFunction(
  logData: ICreateLog,
  res: Response,
  next: NextFunction
) {
  const {
    type,
    mediaId,
    description,
    pages,
    episodes,
    xp,
    time,
    date,
    chars,
    mediaData,
  } = logData;
  let logMedia;
  if (mediaId) {
    logMedia = await Media.findOne({ contentId: mediaId });
  }

  if (
    !logMedia &&
    type !== 'audio' &&
    type !== 'other' &&
    mediaId &&
    mediaData
  ) {
    await Media.create({
      contentId: mediaId,
      title: {
        contentTitleNative: mediaData.contentTitleNative,
        contentTitleEnglish: mediaData.contentTitleEnglish,
        contentTitleRomaji: mediaData.contentTitleRomaji,
      },
      contentImage: mediaData.contentImage,
      coverImage: mediaData.coverImage,
      type,
      description: mediaData.description,
    });
  }

  const newLogMedia = await Media.findOne({
    contentId: mediaId,
  });

  const user: ILog['user'] = res.locals.user._id;
  const newLog: ILog | null = new Log({
    user,
    type,
    mediaId: logMedia
      ? logMedia._id
      : newLogMedia
        ? newLogMedia._id
        : undefined,
    pages,
    episodes,
    xp,
    description,
    time,
    date,
    chars,
  });
  if (!newLog) throw new customError('Log could not be created', 500);
  const savedLog = await newLog.save();
  res.locals.log = savedLog;
  await updateStats(res, next);
  return savedLog;
}

export async function createLog(
  req: Request<ParamsDictionary, any, ICreateLog>,
  res: Response,
  next: NextFunction
) {
  const { type, description } = req.body;

  try {
    if (!type) throw new customError('Log type is required', 400);
    if (!description) throw new customError('Description is required', 400);

    const savedLog = await createLogFunction(req.body, res, next);
    return res.status(200).json(savedLog);
  } catch (error) {
    return next(error as customError);
  }
}

interface IImportStats {
  listeningXp: number;
  readingXp: number;
  anilistMediaId: number[];
}

async function createImportedMedia(userId: ObjectId, mediaIds?: number[]) {
  let logsMediaId: number[] | undefined;

  logsMediaId = mediaIds?.filter((mediaId) => {
    return mediaId !== undefined && mediaId !== null;
  });

  if (logsMediaId && logsMediaId.length === 0) {
    console.log('No mediaId provided, fetching from logs');
    const userLogs = await Log.find({ user: userId });
    logsMediaId = userLogs
      .map((log) => log.mediaId ?? '')
      .filter(Boolean)
      .map((mediaId) => parseInt(mediaId as string, 10));
  }
  const uniqueMediaId = [...new Set(logsMediaId)];

  if (uniqueMediaId.length === 0) {
    return [];
  }
  const mediaData = await searchAnilist({ ids: uniqueMediaId });
  if (mediaData.length === 0) {
    return [];
  }

  const existingMedia = await Media.find({
    contentId: { $in: mediaData.map((media) => media.contentId) },
  }).select('contentId');

  const existingContentIds = new Set(
    existingMedia.map((media) => media.contentId)
  );

  const newMediaData = mediaData.filter(
    (media) => !existingContentIds.has(media.contentId)
  );

  if (newMediaData.length > 0) {
    const media = await Media.insertMany(newMediaData, { ordered: false });
    return media;
  }

  return [];
}

export async function importLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const logs: ILog[] = req.body.logs;
  try {
    const importStats: IImportStats = logs.reduce<IImportStats>(
      (acc, log) => {
        if (
          log.type === 'video' ||
          log.type === 'audio' ||
          log.type === 'anime'
        ) {
          acc.listeningXp += log.xp;
        } else if (
          log.type === 'reading' ||
          log.type === 'manga' ||
          log.type === 'vn'
        ) {
          acc.readingXp += log.xp;
        }
        if (
          log.mediaId &&
          (log.type === 'anime' ||
            log.type === 'manga' ||
            log.type === 'reading')
        ) {
          if (!acc.anilistMediaId.includes(parseInt(log.mediaId))) {
            acc.anilistMediaId.push(parseInt(log.mediaId));
          }
        }
        return acc;
      },
      { listeningXp: 0, readingXp: 0, anilistMediaId: [] }
    );
    res.locals.importedStats = importStats;
    const insertedLogs = await Log.insertMany(logs, {
      ordered: false,
    });
    await updateStats(res, next);

    const user = await User.findById(res.locals.user.id);
    if (!user) throw new customError('User not found', 404);
    user.lastImport = new Date();
    const savedUser = await user.save();
    if (!savedUser) throw new customError('User could not be updated', 500);

    const createdMedia = await createImportedMedia(
      res.locals.user._id,
      importStats.anilistMediaId
    );

    let statusMessage = `${insertedLogs.length} log${
      insertedLogs.length > 1 ? 's' : ''
    } imported successfully`;

    if (insertedLogs.length < logs.length) {
      statusMessage += `\n${logs.length - insertedLogs.length} log${
        logs.length - insertedLogs.length > 1 ? 's' : ''
      } failed to import`;
    } else if (logs.length === 0) {
      statusMessage = 'No logs to import, your logs are up to date';
    }

    if (createdMedia.length > 0) {
      statusMessage += `\n${createdMedia.length} media${
        createdMedia.length > 1 ? 's' : ''
      } imported successfully`;
    }
    return res.status(200).json({
      message: statusMessage,
    });
  } catch (error) {
    return next(error as customError);
  }
}

export async function assignMedia(
  req: Request,
  res: Response,
  next: NextFunction
) {
  interface IAssignData {
    logsId: string[];
    contentMedia: IMediaDocument;
  }
  try {
    const assignData: Array<IAssignData> = req.body;
    assignData.forEach(async (logsData) => {
      let media = await Media.findOne({
        contentId: logsData.contentMedia.contentId,
      });
      if (!media) {
        media = await Media.create(logsData.contentMedia);
      }
      const updatedLogs = await Log.updateMany(
        {
          _id: { $in: logsData.logsId },
        },
        { mediaId: media._id }
      );
      if (!updatedLogs)
        throw new customError(
          `Log${logsData.logsId.length > 1 || 's'} not found`,
          404
        );

      return res.status(200).json(updatedLogs);
    });
  } catch (error) {
    return next(error as customError);
  }
}
