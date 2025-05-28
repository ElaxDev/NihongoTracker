import { Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import { MediaBase, Anime, Manga, Reading } from '../models/media.model.js';
import { ILog, IEditedFields, ICreateLog, IMediaDocument } from '../types.js';
import Log from '../models/log.model.js';
import User from '../models/user.model.js';
import { ObjectId, PipelineStage, Types } from 'mongoose';
import { customError } from '../middlewares/errorMiddleware.js';
import updateStats from '../services/updateStats.js';
import { searchAnilist } from '../services/searchAnilist.js';
import { updateLevelAndXp } from '../services/updateStats.js';
import {
  XP_FACTOR_TIME,
  XP_FACTOR_CHARS,
  XP_FACTOR_EPISODES,
  XP_FACTOR_PAGES,
} from '../middlewares/calculateXp.js';

export async function getUntrackedLogs(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = res.locals;
  try {
    const untrackedLogs = await Log.find({
      user: user._id,
      type: { $in: ['anime', 'manga', 'reading', 'vn'] },
      mediaId: { $exists: false },
    });
    return res.status(200).json(untrackedLogs);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getRecentLogs(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = res.locals;
  const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;

  try {
    const recentLogs = await Log.aggregate([
      {
        $match: {
          user: user._id,
        },
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: {
          path: '$user',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: 'media',
          localField: 'mediaId',
          foreignField: 'contentId',
          as: 'media',
        },
      },
      {
        $unwind: {
          path: '$media',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          date: 1,
          description: 1,
          type: 1,
          time: 1,
          episodes: 1,
          mediaId: 1,
          media: 1,
          xp: 1,
        },
      },
    ]);

    return res.status(200).json(recentLogs);
  } catch (error) {
    return next(error as customError);
  }
}

export async function getDashboardHours(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  const { user } = res.locals;
  try {
    // Get date ranges for current month and previous month
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1
    );
    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    // Define reading and listening types
    const readingTypes = ['reading', 'manga', 'vn'];
    const listeningTypes = ['anime', 'audio', 'video'];

    // Get current month stats
    const currentMonthStats = await Log.aggregate([
      {
        $match: {
          user: user._id,
          date: { $gte: currentMonthStart, $lte: now },
        },
      },
      {
        $group: {
          _id: null,
          totalTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', 'anime'] },
                    {
                      $or: [
                        { $eq: ['$time', 0] },
                        { $eq: ['$time', null] },
                        { $eq: [{ $type: '$time' }, 'missing'] },
                      ],
                    },
                    { $gt: ['$episodes', 0] },
                  ],
                },
                { $multiply: ['$episodes', 24] }, // 24 minutes per episode
                '$time',
              ],
            },
          },
          readingTime: {
            $sum: {
              $cond: [{ $in: ['$type', readingTypes] }, '$time', 0],
            },
          },
          listeningTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', 'anime'] },
                    {
                      $or: [
                        { $eq: ['$time', 0] },
                        { $eq: ['$time', null] },
                        { $eq: [{ $type: '$time' }, 'missing'] },
                      ],
                    },
                    { $gt: ['$episodes', 0] },
                  ],
                },
                { $multiply: ['$episodes', 24] }, // 24 minutes per episode
                {
                  $cond: [{ $in: ['$type', listeningTypes] }, '$time', 0],
                },
              ],
            },
          },
        },
      },
    ]);

    // Get previous month stats
    const previousMonthStats = await Log.aggregate([
      {
        $match: {
          user: user._id,
          date: { $gte: previousMonthStart, $lte: previousMonthEnd },
        },
      },
      {
        $group: {
          _id: null,
          totalTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', 'anime'] },
                    {
                      $or: [
                        { $eq: ['$time', 0] },
                        { $eq: ['$time', null] },
                        { $eq: [{ $type: '$time' }, 'missing'] },
                      ],
                    },
                    { $gt: ['$episodes', 0] },
                  ],
                },
                { $multiply: ['$episodes', 24] }, // 24 minutes per episode
                '$time',
              ],
            },
          },
          readingTime: {
            $sum: {
              $cond: [{ $in: ['$type', readingTypes] }, '$time', 0],
            },
          },
          listeningTime: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$type', 'anime'] },
                    {
                      $or: [
                        { $eq: ['$time', 0] },
                        { $eq: ['$time', null] },
                        { $eq: [{ $type: '$time' }, 'missing'] },
                      ],
                    },
                    { $gt: ['$episodes', 0] },
                  ],
                },
                { $multiply: ['$episodes', 24] }, // 24 minutes per episode
                {
                  $cond: [{ $in: ['$type', listeningTypes] }, '$time', 0],
                },
              ],
            },
          },
        },
      },
    ]);

    // Ensure we have default values if no logs were found
    const current =
      currentMonthStats.length > 0
        ? currentMonthStats[0]
        : {
            totalTime: 0,
            readingTime: 0,
            listeningTime: 0,
          };

    const previous =
      previousMonthStats.length > 0
        ? previousMonthStats[0]
        : {
            totalTime: 0,
            readingTime: 0,
            listeningTime: 0,
          };

    // Remove _id from the results
    delete current._id;
    delete previous._id;

    return res.status(200).json({
      currentMonth: current,
      previousMonth: previous,
    });
  } catch (error) {
    return next(error as customError);
  }
}

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

  // Add start and end date filters
  const startDate = req.query.start
    ? new Date(req.query.start as string)
    : null;
  const endDate = req.query.end ? new Date(req.query.end as string) : null;

  // Add type filter
  const type = req.query.type as string;

  try {
    // Check if username exists
    if (!req.params.username) {
      throw new customError('Username is required', 400);
    }

    // First verify the user exists
    const userExists = await User.findOne({ username: req.params.username });
    if (!userExists) {
      throw new customError('User not found', 404);
    }

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
        $unwind: '$user',
      },
      {
        $match: {
          'user.username': req.params.username,
        },
      },
      // Add type filter if provided
      ...(type ? [{ $match: { type } }] : []),
      {
        $sort: {
          date: -1,
        },
      },
      {
        $lookup: {
          from: 'media',
          localField: 'mediaId',
          foreignField: 'contentId',
          as: 'media',
        },
      },
      {
        $unwind: {
          path: '$media',
          preserveNullAndEmptyArrays: true,
        },
      },
      ...(req.query.mediaId
        ? [{ $match: { mediaId: req.query.mediaId } }]
        : []),
      ...(req.query.mediaType
        ? [{ $match: { type: req.query.mediaType } }]
        : []),
      // Add date filter if start or end date is provided
      ...(startDate || endDate
        ? [
            {
              $match: {
                date: {
                  ...(startDate && { $gte: startDate }),
                  ...(endDate && { $lte: endDate }),
                },
              },
            },
          ]
        : []),
      {
        $project: {
          _id: 1,
          type: 1,
          mediaId: 1,
          xp: 1,
          description: 1,
          episodes: 1,
          pages: 1,
          chars: 1,
          time: 1,
          date: 1,
          'media.contentId': 1,
          'media.title': 1,
          'media.contentImage': 1,
          'media.type': 1,
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

    console.log(
      `Fetching logs for user: ${req.params.username}, type: ${type || 'all'}, limit: ${limit}`
    );

    const logs = await Log.aggregate(pipeline, {
      collation: { locale: 'en', strength: 2 },
    });

    console.log(
      `Found ${logs.length} ${type || 'all'} logs for user: ${req.params.username}`
    );

    if (!logs.length) return res.sendStatus(204);

    return res.status(200).json(logs);
  } catch (error) {
    console.error('Error in getUserLogs:', error);
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
    const deletedLog = await Log.findOneAndDelete({
      _id: req.params.id,
      user: res.locals.user.id,
    });

    res.locals.log = deletedLog;

    if (!deletedLog) {
      throw new customError('Log not found or not authorized', 404);
    }
    await updateStats(res, next);
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

    log.editedFields = null;
    await log.save();

    return res.sendStatus(204);
  } catch (error) {
    return next(error as customError);
  }
}

export async function createLog(
  req: Request<ParamsDictionary, any, ICreateLog>,
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
  } = req.body;

  try {
    if (!type) throw new customError('Log type is required', 400);
    if (!description) throw new customError('Description is required', 400);
    let logMedia;
    console.log(req.body);
    if (mediaId) {
      logMedia = await MediaBase.findOne({ contentId: mediaId });
    }

    if (
      !logMedia &&
      type !== 'audio' &&
      type !== 'other' &&
      mediaId &&
      mediaData
    ) {
      await MediaBase.create({
        contentId: mediaId,
        title: {
          contentTitleNative: mediaData.contentTitleNative,
          contentTitleEnglish: mediaData.contentTitleEnglish,
          contentTitleRomaji: mediaData.contentTitleRomaji,
        },
        contentImage: mediaData.contentImage,
        episodes: mediaData.episodes,
        episodeDuration: mediaData.episodeDuration,
        synonyms: mediaData.synonyms,
        chapters: mediaData.chapters,
        volumes: mediaData.volumes,
        isAdult: mediaData.isAdult,
        coverImage: mediaData.coverImage,
        type,
        description: mediaData.description,
      });
    }

    const newLogMedia = await MediaBase.findOne({
      contentId: mediaId,
    });

    const user: ILog['user'] = res.locals.user._id;
    const newLog: ILog | null = new Log({
      user,
      type,
      mediaId: logMedia
        ? logMedia.contentId
        : newLogMedia
          ? newLogMedia.contentId
          : undefined,
      pages,
      episodes,
      xp,
      description,
      private: false,
      time,
      date,
      chars,
    });
    if (!newLog) throw new customError('Log could not be created', 500);
    const savedLog = await newLog.save();
    if (!savedLog) throw new customError('Log could not be saved', 500);
    res.locals.log = savedLog;
    await updateStats(res, next);
    const userStats = await User.findById(res.locals.user._id);
    if (!userStats) throw new customError('User not found', 404);
    // Check if lastStreakDate is yesterday
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (
      userStats.stats.lastStreakDate &&
      userStats.stats.lastStreakDate.toDateString() === yesterday.toDateString()
    ) {
      userStats.stats.currentStreak += 1;
    } else if (
      userStats.stats.lastStreakDate &&
      userStats.stats.lastStreakDate.toDateString() !== yesterday.toDateString()
    ) {
      userStats.stats.currentStreak = 1;
    }
    userStats.stats.lastStreakDate = new Date();
    if (userStats.stats.currentStreak > userStats.stats.longestStreak) {
      userStats.stats.longestStreak = userStats.stats.currentStreak;
    }
    await userStats.save();

    return res.status(200).json(savedLog);
  } catch (error) {
    return next(error as customError);
  }
}

interface IImportStats {
  listeningXp: number;
  readingXp: number;
  anilistMediaId: {
    anime: number[];
    manga: number[];
    reading: number[];
  };
}

async function createImportedMedia(
  userId: ObjectId,
  mediaIds?: IImportStats['anilistMediaId']
) {
  let logsMediaId: IImportStats['anilistMediaId'] | undefined;
  let createdMediaCount = 0;

  logsMediaId = mediaIds;

  if (
    logsMediaId &&
    (logsMediaId.anime.length > 0 ||
      logsMediaId.manga.length > 0 ||
      logsMediaId.reading.length > 0)
  ) {
    const userLogs = await Log.find({ user: userId });
    if (!userLogs) return 0;
    const logsMediaId = userLogs.reduce<IImportStats['anilistMediaId']>(
      (acc, log) => {
        if (log.mediaId) {
          if (log.type === 'anime') {
            acc.anime.push(parseInt(log.mediaId));
          } else if (log.type === 'manga') {
            acc.manga.push(parseInt(log.mediaId));
          } else if (log.type === 'reading') {
            acc.reading.push(parseInt(log.mediaId));
          }
        }
        return acc;
      },
      { anime: [], manga: [], reading: [] }
    );
    if (logsMediaId.anime.length > 0) {
      logsMediaId.anime = [...new Set(logsMediaId.anime)];
    }
    if (logsMediaId.manga.length > 0) {
      logsMediaId.manga = [...new Set(logsMediaId.manga)];
    }
    if (logsMediaId.reading.length > 0) {
      logsMediaId.reading = [...new Set(logsMediaId.reading)];
    }
  }

  for (const type in logsMediaId) {
    if (logsMediaId[type as keyof IImportStats['anilistMediaId']].length > 0) {
      const existingMedia = await MediaBase.find({
        contentId: {
          $in: logsMediaId[type as keyof IImportStats['anilistMediaId']].map(
            (id) => id.toString()
          ),
        },
      }).select('contentId');
      const existingContentIds = new Set(
        existingMedia.map((media) => media.contentId)
      );
      const newMediaId = logsMediaId[
        type as keyof IImportStats['anilistMediaId']
      ].filter((id) => !existingContentIds.has(id.toString()));
      const mediaData = await searchAnilist({
        ids: newMediaId,
        type: type === 'anime' ? 'ANIME' : 'MANGA',
      });
      if (mediaData.length > 0) {
        if (type === 'anime') {
          Anime.insertMany(mediaData, {
            ordered: false,
          });
        } else if (type === 'manga') {
          Manga.insertMany(mediaData, {
            ordered: false,
          });
        } else if (type === 'reading') {
          Reading.insertMany(mediaData, {
            ordered: false,
          });
        }
        return (createdMediaCount += mediaData.length);
      }
    }
  }
  return createdMediaCount;
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
          if (!acc.anilistMediaId[log.type].includes(parseInt(log.mediaId))) {
            acc.anilistMediaId[log.type].push(parseInt(log.mediaId));
          }
        }
        return acc;
      },
      {
        listeningXp: 0,
        readingXp: 0,
        anilistMediaId: { anime: [], manga: [], reading: [] },
      }
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

    if (createdMedia > 0) {
      statusMessage += `\n${createdMedia} media${
        createdMedia > 1 ? 's' : ''
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

    const results = await Promise.all(
      assignData.map(async (logsData) => {
        let media = await MediaBase.findOne({
          contentId: logsData.contentMedia.contentId,
        });
        if (!media) {
          media = await MediaBase.create(logsData.contentMedia);
        }
        const updatedLogs = await Log.updateMany(
          {
            _id: { $in: logsData.logsId },
          },
          { mediaId: media.contentId }
        );
        if (!updatedLogs)
          throw new customError(
            `Log${logsData.logsId.length > 1 ? 's' : ''} not found`,
            404
          );

        return updatedLogs;
      })
    );

    return res.status(200).json({ results });
  } catch (error) {
    return next(error as customError);
  }
}

interface IGetUserStatsQuery {
  timeRange?: 'today' | 'month' | 'year' | 'total';
  type?: 'all' | 'anime' | 'manga' | 'reading' | 'audio' | 'video';
}

interface IUserStats {
  totals: {
    totalLogs: number;
    totalXp: number;
    totalTimeHours: number;
    untrackedCount: number;
  };
  statsByType: Array<{
    type: string;
    count: number;
    totalXp: number;
    totalTimeMinutes: number;
    totalTimeHours: number;
    untrackedCount: number;
    dates: Array<{
      date: Date;
      xp: number;
      time?: number;
      episodes?: number;
    }>;
  }>;
  readingSpeedData?: Array<{
    date: Date;
    type: string;
    time: number;
    chars?: number;
    pages?: number;
    charsPerHour?: number | null;
  }>;
  timeRange: 'today' | 'month' | 'year' | 'total';
  selectedType: string;
}

export async function getUserStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<IUserStats> | void> {
  try {
    const { username } = req.params;
    const { timeRange = 'total', type = 'all' } =
      req.query as IGetUserStatsQuery;
    // Validate timeRange
    const validTimeRanges = ['today', 'month', 'year', 'total'];
    if (!validTimeRanges.includes(timeRange)) {
      return res.status(400).json({ message: 'Invalid time range' });
    }
    // Validate type
    const validTypes = [
      'all',
      'anime',
      'manga',
      'reading',
      'audio',
      'video',
      'vn',
      'other',
    ];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid type' });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Build date filter
    let dateFilter: any = {};
    const now = new Date();
    if (timeRange === 'today') {
      const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { date: { $gte: start } };
    } else if (timeRange === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter = { date: { $gte: start } };
    } else if (timeRange === 'year') {
      const start = new Date(now.getFullYear(), 0, 1);
      dateFilter = { date: { $gte: start } };
    }

    // Build type filter
    let match: any = { user: user._id, ...dateFilter };
    if (type !== 'all') {
      match.type = type;
    }

    const logTypes = [
      'reading',
      'anime',
      'vn',
      'video',
      'manga',
      'audio',
      'other',
    ];

    // Aggregate stats by type
    const statsByType = await Log.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalXp: { $sum: '$xp' },
          totalTime: {
            $sum: {
              $cond: [
                { $eq: ['$type', 'anime'] },
                {
                  $cond: [
                    { $ifNull: ['$time', false] },
                    '$time',
                    {
                      $cond: [
                        { $ifNull: ['$episodes', false] },
                        { $multiply: ['$episodes', 24] },
                        0,
                      ],
                    },
                  ],
                },
                {
                  $cond: [{ $ifNull: ['$time', false] }, '$time', 0],
                },
              ],
            },
          },
          // Add additional fields for detailed charts
          untrackedCount: {
            $sum: {
              $cond: [
                {
                  $or: [
                    {
                      $and: [
                        { $eq: ['$type', 'anime'] },
                        { $eq: ['$time', null] },
                        { $eq: ['$episodes', null] },
                      ],
                    },
                    {
                      $and: [
                        { $ne: ['$type', 'anime'] },
                        { $eq: ['$time', null] },
                      ],
                    },
                  ],
                },
                1,
                0,
              ],
            },
          },
          // Collect dates for progress charts
          dates: {
            $push: {
              date: '$date',
              xp: '$xp',
              time: '$time',
              episodes: '$episodes',
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          type: '$_id',
          count: 1,
          totalXp: 1,
          totalTimeMinutes: '$totalTime',
          totalTimeHours: { $divide: ['$totalTime', 60] },
          untrackedCount: 1,
          dates: 1,
        },
      },
    ]);

    // Create a complete dataset with all types (even if empty)
    const completeStats = logTypes.map((type) => {
      const typeStat = statsByType.find((stat) => stat.type === type);
      return (
        typeStat || {
          type,
          count: 0,
          totalXp: 0,
          totalTimeMinutes: 0,
          totalTimeHours: 0,
          untrackedCount: 0,
          dates: [],
        }
      );
    });

    // Calculate overall totals
    const totals = statsByType.reduce(
      (acc, stat) => {
        acc.totalLogs += stat.count;
        acc.totalXp += stat.totalXp;
        acc.totalTimeHours += stat.totalTimeHours;
        acc.untrackedCount += stat.untrackedCount;
        return acc;
      },
      {
        totalLogs: 0,
        totalXp: 0,
        totalTimeHours: 0,
        untrackedCount: 0,
      }
    );

    // Calculate reading speed data for reading-type logs
    const readingSpeedData =
      type === 'all' || ['reading', 'manga', 'vn'].includes(type)
        ? await Log.aggregate([
            {
              $match: {
                user: user._id,
                ...dateFilter,
                type: { $in: ['reading', 'manga', 'vn'] },
                time: { $ne: null, $gt: 0 },
                $or: [
                  { chars: { $ne: null, $gt: 0 } },
                  { pages: { $ne: null, $gt: 0 } },
                ],
              },
            },
            {
              $project: {
                date: 1,
                type: 1,
                time: 1,
                chars: 1,
                pages: 1,
                charsPerHour: {
                  $cond: [
                    { $and: [{ $gt: ['$chars', 0] }, { $gt: ['$time', 0] }] },
                    { $divide: [{ $multiply: ['$chars', 60] }, '$time'] },
                    null,
                  ],
                },
              },
            },
            {
              $sort: { date: 1 },
            },
          ])
        : [];

    // Return comprehensive stats object
    return res.json({
      totals,
      statsByType: completeStats,
      readingSpeedData,
      timeRange,
      selectedType: type,
    });
  } catch (error) {
    return next(error);
  }
}

export async function recalculateXp(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Check admin permission
    if (!res.locals.user.roles.includes('admin')) {
      return res.status(403).json({ message: 'Admin permission required' });
    }

    // Get all users
    const users = await User.find({});

    if (!users.length) {
      return res.status(404).json({ message: 'No users found' });
    }

    const results = {
      totalUsers: users.length,
      processedUsers: 0,
      updatedLogs: 0,
      errors: [] as string[],
    };

    // Process each user
    for (const user of users) {
      try {
        // Reset user's stats
        if (user.stats) {
          user.stats.readingXp = 0;
          user.stats.listeningXp = 0;
          user.stats.userXp = 0;
        }

        // Get all logs for this user
        const logs = await Log.find({ user: user._id });

        if (!logs.length) {
          continue;
        }

        // Process each log
        for (const log of logs) {
          // Recalculate XP
          const timeXp = log.time
            ? Math.floor(((log.time * 45) / 100) * XP_FACTOR_TIME)
            : 0;
          const charsXp = log.chars
            ? Math.floor((log.chars / 350) * XP_FACTOR_CHARS)
            : 0;
          const pagesXp = log.pages
            ? Math.floor(log.pages * XP_FACTOR_PAGES)
            : 0;
          const episodesXp = log.episodes
            ? Math.floor(((log.episodes * 45) / 100) * XP_FACTOR_EPISODES)
            : 0;

          const oldXp = log.xp;

          // Calculate new XP based on log type
          switch (log.type) {
            case 'anime':
              log.xp = timeXp || episodesXp || 0;
              break;
            case 'reading':
            case 'manga':
            case 'vn':
            case 'video':
            case 'other':
            case 'audio':
              log.xp = Math.max(timeXp, pagesXp, charsXp, episodesXp, 0);
              break;
          }

          // Only save if XP changed
          if (log.xp !== oldXp) {
            await log.save();
            results.updatedLogs++;
          }

          // Update user's stats totals
          if (user.stats) {
            if (['anime', 'video', 'audio'].includes(log.type)) {
              user.stats.listeningXp += log.xp;
            } else if (['reading', 'manga', 'vn'].includes(log.type)) {
              user.stats.readingXp += log.xp;
            }
            user.stats.userXp += log.xp;
          }
        }

        // Recalculate levels
        if (user.stats) {
          updateLevelAndXp(user.stats, 'reading');
          updateLevelAndXp(user.stats, 'listening');
          updateLevelAndXp(user.stats, 'user');

          // Save user with updated stats
          await user.save();
        }
        results.processedUsers++;
      } catch (error) {
        const customError = error as customError;
        results.errors.push(
          `Error processing user ${user.username}: ${customError.message}`
        );
      }
    }

    return res.status(200).json({
      message: `Recalculated stats for ${results.processedUsers} users (${results.updatedLogs} logs updated)`,
      results,
    });
  } catch (error) {
    return next(error as customError);
  }
}
