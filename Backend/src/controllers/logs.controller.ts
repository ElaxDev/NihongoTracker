import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import {
  ILog,
  IEditedFields,
  ICreateLog,
  IImmersionListItem,
  IImmersionListItemMedia,
} from '../types';
import Log from '../models/log.model';
import User from '../models/user.model';
import ImmersionListModel from '../models/immersionList.model';
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
  const { description, time, date, contentId, episodes, pages, chars } =
    req.body;

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
    log.contentId = contentId !== undefined ? contentId : log.contentId;
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
    contentId,
    contentMedia,
    pages,
    episodes,
    xp,
    description,
    mediaName,
    time,
    date,
    chars,
  } = logData;

  if (!type) throw new customError('Log type is required', 400);
  if (!mediaName) throw new customError('Description is required', 400);

  if (contentId && contentMedia && type !== 'audio' && type !== 'other') {
    let immersionList = await ImmersionListModel.findById(
      res.locals.user.immersionList
    );

    if (!res.locals.user.immersionList || !immersionList) {
      immersionList = await ImmersionListModel.create({});
      res.locals.user.immersionList = immersionList._id;
      await res.locals.user.save();
    }

    if (!immersionList) throw new customError('Immersion List not found', 404);

    if (
      contentId &&
      !immersionList[type].some(
        (item: IImmersionListItem) => item.contentId === contentId
      )
    ) {
      immersionList[type] = [
        ...immersionList[type],
        { contentId: contentId, contentMedia: contentMedia },
      ];
      await immersionList.save();
    }
  }

  const user: ILog['user'] = res.locals.user._id;
  const newLog: ILog | null = new Log({
    user,
    type,
    contentId,
    pages,
    episodes,
    xp,
    description,
    mediaName,
    time,
    date,
    chars,
  });
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
  const { type, description, mediaName } = req.body;

  try {
    if (!type) throw new customError('Log type is required', 400);
    if (!mediaName && !description) {
      if (type === 'audio' || type === 'other') {
        req.body.mediaName = 'Audio/Other';
      }
      if (!mediaName && !description) {
        throw new customError('Description is required', 400);
      }
    }
    const savedLog = await createLogFunction(req.body, res, next);
    return res.status(200).json(savedLog);
  } catch (error) {
    return next(error as customError);
  }
}

interface Results {
  success: ILog[];
  failed: { log: ILog; error: string }[];
}

export async function importLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const logs: ILog[] = req.body;
  const results: Results = { success: [], failed: [] };
  for (const log of logs) {
    try {
      const savedLog = await createLogFunction(log, res, next);
      results.success.push(savedLog);
    } catch (error) {
      results.failed.push({ log, error: (error as customError).message });
    }
  }
  const user = await User.findById(res.locals.user.id);
  if (!user) throw new customError('User not found', 404);
  user.lastImport = new Date();
  user.save();
  let statusMessage = `${results.success.length} log${
    results.success.length > 1 ? 's' : ''
  } imported successfully`;
  if (results.failed.length) {
    statusMessage += `\n${results.failed.length} log${
      results.failed.length > 1 ? 's' : ''
    } failed to import`;
  } else if (results.success.length === 0) {
    statusMessage = 'No logs to import, your logs are up to date';
  }
  // console.log(results.failed);
  return res.status(200).json({
    message: statusMessage,
  });
}

export async function assignMedia(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const assignData: {
      logsId: string[];
      mediaId: string;
      mediaType: 'reading' | 'anime' | 'vn' | 'video' | 'manga';
      contentMedia: IImmersionListItemMedia;
    } = req.body;
    const updatedLogs = await Log.updateMany(
      { _id: { $in: assignData.logsId } },
      { contentId: assignData.mediaId },
      { new: true }
    );
    if (!updatedLogs)
      throw new customError(
        `Log${assignData.logsId.length > 1 || 's'} not found`,
        404
      );
    if (!res.locals.user.immersionList) {
      const immersionList = await ImmersionListModel.create({});
      res.locals.user.immersionList = immersionList._id;
      await res.locals.user.save();
    }
    const immersionList = await ImmersionListModel.findById(
      res.locals.user.immersionList
    );

    if (!immersionList) throw new customError('Immersion List not found', 404);
    if (
      assignData.mediaId &&
      !immersionList[assignData.mediaType].some(
        (item: IImmersionListItem) => item.contentId === assignData.mediaId
      )
    ) {
      immersionList[assignData.mediaType].push({
        contentId: assignData.mediaId,
        contentMedia: assignData.contentMedia,
      });
      await immersionList.save();
    }

    return res.status(200).json(updatedLogs);
  } catch (error) {
    return next(error as customError);
  }
}
