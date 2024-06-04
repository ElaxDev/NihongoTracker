import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { customError } from './errorMiddleware';
import { IUser } from '../types';

type manabeLogs = {
  _id: string;
  anilistAccount: string;
  anilistId: number;
  descripcion: string;
  id: number;
  medio: string;
  parametro: number;
  puntos: number;
  timestamp: number;
  userId: number;
};

interface LogTypeMap {
  [key: string]: {
    logType: string;
    parametro: string;
  };
}

function transformList(list: manabeLogs[]) {
  const logTypeMap: LogTypeMap = {
    ANIME: { logType: 'anime', parametro: 'episodes' },
    MANGA: { logType: 'manga', parametro: 'pages' },
    LECTURA: { logType: 'reading', parametro: 'chars' },
    TIEMPOLECTURA: { logType: 'reading', parametro: 'time' },
    VN: { logType: 'vn', parametro: 'chars' },
    VIDEO: { logType: 'video', parametro: 'time' },
    AUDIO: { logType: 'audio', parametro: 'time' },
    OUTPUT: { logType: 'other', parametro: 'time' },
  };

  return list
    .filter((log) => logTypeMap.hasOwnProperty(log.medio))
    .map((log) => {
      const { logType, parametro } = logTypeMap[log.medio];

      return {
        description: log.descripcion,
        type: logType,
        [parametro]: log.parametro,
        date: new Date(log.timestamp * 1000),
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
    const response = await axios.get(
      `https://api.manabe.es/logs?userId=${res.locals.user.discordId}`
    );
    const logs = transformList(response.data);
    req.body = logs;
    return next();
  } catch (error) {
    return next(error as customError);
  }
}
