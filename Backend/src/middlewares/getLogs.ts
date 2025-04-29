import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { customError } from './errorMiddleware.js';
import { IUser } from '../types.js';

type manabeLogs = {
  _id: string;
  anilistAccount: string;
  anilistId: number;
  timestamp: number;
  descripcion: string;
  id: number;
  medio: string;
  tiempo: number;
  caracteres: number;
  parametro: number;
  puntos: number;
  createdAt: string;
  officialId: string;
  bonus: boolean;
  userId: number;
};

interface LogTypeMap {
  [key: string]: {
    logType: string;
    parametro: string;
    tiempo?: boolean;
    chars?: boolean;
    officialId?: boolean;
  };
}

function transformList(list: manabeLogs[], user: Omit<IUser, 'password'>) {
  const logTypeMap: LogTypeMap = {
    ANIME: {
      logType: 'anime',
      parametro: 'episodes',
      tiempo: true,
      chars: true,
      officialId: true,
    },
    MANGA: { logType: 'manga', parametro: 'pages', tiempo: true, chars: true },
    LECTURA: { logType: 'reading', parametro: 'chars', tiempo: true },
    TIEMPOLECTURA: { logType: 'reading', parametro: 'time', chars: true },
    VN: { logType: 'vn', parametro: 'chars', tiempo: true, officialId: true },
    VIDEO: { logType: 'video', parametro: 'time' },
    AUDIO: { logType: 'audio', parametro: 'time' },
    OUTPUT: { logType: 'other', parametro: 'time' },
    JUEGO: { logType: 'other', parametro: 'time' },
  };

  return list
    .filter((log) => logTypeMap.hasOwnProperty(log.medio))
    .map((log) => {
      const { logType, parametro, tiempo, chars, officialId } =
        logTypeMap[log.medio];

      return {
        user: user._id,
        description: log.descripcion,
        type: logType,
        [parametro]: log.parametro,
        ...(tiempo ? { time: log.tiempo } : {}),
        ...(chars ? { chars: log.caracteres } : {}),
        ...(officialId ? { mediaId: log.officialId } : {}),
        date: new Date(log.createdAt),
      };
    });
}

export default async function getLogsFromAPI(
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
    const logs = transformList(response.data, user);
    req.body.logs = logs;
    return next();
  } catch (error) {
    return next(error as customError);
  }
}
