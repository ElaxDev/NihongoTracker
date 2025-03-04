import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import Media from '../models/media.model';
import { ILog, IEditedFields, ICreateLog, IMediaDocument } from '../types';
import Log from '../models/log.model';
import User from '../models/user.model';
import { PipelineStage, Types } from 'mongoose';
import { customError } from '../middlewares/errorMiddleware';
import updateStats from '../services/updateStats';

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
  console.time('createLogFunction');
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
  const savedLog = await newLog.save();
  res.locals.log = savedLog;
  console.timeEnd('createLogFunction');
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
}

export async function importLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const logs: ILog[] = req.body.logs;
  try {
    console.time('importLogs');
    const importStats: IImportStats = logs.reduce(
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
        return acc;
      },
      { listeningXp: 0, readingXp: 0 }
    );

    res.locals.importedStats = importStats;
    const insertedLogs = await Log.insertMany(logs, {
      ordered: false,
    });
    await updateStats(res, next);

    const user = await User.findById(res.locals.user.id);
    if (!user) throw new customError('User not found', 404);
    user.lastImport = new Date();
    user.save();

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
    console.timeEnd('importLogs');
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
