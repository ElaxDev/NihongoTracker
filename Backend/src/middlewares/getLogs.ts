import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { customError } from './errorMiddleware.js';
import { IUser, ILog, csvLogs } from '../types.js';
import { Types } from 'mongoose';
import User from '../models/user.model.js';

type manabeLogs = {
  descripcion: string;
  medio:
    | 'ANIME'
    | 'MANGA'
    | 'LECTURA'
    | 'TIEMPOLECTURA'
    | 'VN'
    | 'VIDEO'
    | 'AUDIO'
    | 'OUTPUT'
    | 'JUEGO'
    | 'LIBRO';
  tiempo?: number;
  caracteres?: number;
  parametro: number;
  createdAt: string;
  officialId?: string;
};

interface ILogManabeTypeMap {
  [key: string]: {
    logType: ILog['type'];
    parametro: string;
    tiempo?: boolean;
    chars?: boolean;
    officialId?: boolean;
  };
}

interface ILogCSVTypeMap {
  [key: string]: string;
}

interface ManabeWebhookBody {
  userDiscordId: string;
  logInfo: manabeLogs;
  token: string;
}

interface ILogNT {
  user: Types.ObjectId;
  description: string;
  type: ILog['type'];
  episodes?: number;
  time?: number;
  chars?: number;
  pages?: number;
  mediaId?: string;
  date: Date;
}

function transformManabeLogsList(
  list: manabeLogs[],
  user: Omit<IUser, 'password'>
) {
  const logTypeMap: ILogManabeTypeMap = {
    ANIME: {
      logType: 'anime',
      parametro: 'episodes',
    },
    MANGA: {
      logType: 'manga',
      parametro: 'pages',
    },
    LECTURA: {
      logType: 'reading',
      parametro: 'chars',
    },
    TIEMPOLECTURA: {
      logType: 'reading',
      parametro: 'time',
    },
    VN: { logType: 'vn', parametro: 'chars' },
    VIDEO: { logType: 'video', parametro: 'time' },
    AUDIO: { logType: 'audio', parametro: 'time' },
    OUTPUT: { logType: 'other', parametro: 'time' },
    JUEGO: { logType: 'other', parametro: 'time' },
    LIBRO: { logType: 'reading', parametro: 'pages' },
  };

  return list
    .filter((log) => logTypeMap.hasOwnProperty(log.medio))
    .map((log) => {
      const { logType, parametro } = logTypeMap[log.medio];

      const NTLogs: ILogNT = {
        user: user._id,
        description: log.descripcion,
        type: logType,
        [parametro]: log.parametro,
        date: new Date(log.createdAt),
      };

      if (log.tiempo) {
        NTLogs.time = log.tiempo;
      }
      if (log.caracteres) {
        NTLogs.chars = log.caracteres;
      }
      if (log.officialId) {
        NTLogs.mediaId = log.officialId;
      }

      return NTLogs;
    });
}

export async function getLogsFromAPI(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user: Omit<IUser, 'password'> = res.locals.user;
    if (!user) throw new customError('User not found', 404);
    if (!user.discordId) throw new customError('Discord ID not set', 400);
    const apiUrl = process.env.MANABE_API_URL;
    if (!apiUrl) {
      throw new customError('API URL not set', 500);
    }
    const response = await axios.get(apiUrl, {
      params: {
        user: user.discordId,
        startDate: user.lastImport,
        limit: 0,
        page: 1,
      },
    });
    const logs = transformManabeLogsList(response.data, user);
    req.body.logs = logs;
    return next();
  } catch (error) {
    return next(error as customError);
  }
}

export async function importManabeLog(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { token, userDiscordId, logInfo } = req.body as ManabeWebhookBody;

  if (token !== process.env.MANABE_WEBHOOK_TOKEN) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  if (!userDiscordId || !logInfo) {
    return res.status(400).json({ message: 'Bad Request' });
  }

  const user = await User.findOne({ discordId: userDiscordId });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.locals.user = user;
  req.body.logs = transformManabeLogsList([logInfo], user);

  return next();
}

function transformCSVLogsList(
  list: csvLogs[],
  user: Omit<IUser, 'password'>
): ILogNT[] {
  const logTypeMap: ILogCSVTypeMap = {
    anime: 'episodes',
    manga: 'pages',
    reading: 'chars',
    vn: 'chars',
    video: 'time',
    audio: 'time',
    other: 'time',
  };

  return list
    .filter((log) => logTypeMap.hasOwnProperty(log.type))
    .map((log) => {
      const NTLogs: ILogNT = {
        user: user._id,
        description: log.description,
        type: log.type,
        [logTypeMap[log.type]]: log.quantity,
        date: new Date(log.date),
      };

      if (log.time) {
        NTLogs.time = parseInt(log.time);
      }
      if (log.chars) {
        NTLogs.chars = parseInt(log.chars);
      }
      if (log.mediaId) {
        NTLogs.mediaId = log.mediaId;
      }
      return NTLogs;
    });
}

export async function getLogsFromCSV(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const logs = transformCSVLogsList(req.body.logs, res.locals.user);
    if (!logs) throw new customError('No logs found', 404);
    if (logs.length === 0) throw new customError('No logs found', 404);
    req.body.logs = logs;
    return next();
  } catch (error) {
    return next(error as customError);
  }
}
