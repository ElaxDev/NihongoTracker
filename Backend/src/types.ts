import { Request } from 'express';
import { Types } from 'mongoose';

export interface decodedJWT {
  id: Types.ObjectId;
  iat: number;
  exp: number;
}

export interface tokenDataType {
  id: Types.ObjectId;
}

export interface IStat {
  readingXp: number;
  readingLevel: number;
  listeningXp: number;
  listeningLevel: number;
  charCountVn: number;
  charCountLn: number;
  charCountReading: number;
  pageCountLn: number;
  readingTimeLn: number;
  pageCountManga: number;
  charCountManga: number;
  readingTimeManga: number;
  mangaPages: number;
  listeningTime: number;
  readingTime: number;
  animeEpisodes: number;
  animeWatchingTime: number;
  videoWatchingTime: number;
  lnCount: number;
  readManga: string[];
  watchedAnime: string[];
  playedVn: string[];
  readLn: string[];
  knownWords: string[];
}

export interface ILog {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: 'reading' | 'anime' | 'vn' | 'video' | 'ln' | 'manga';
  contentId?: string;
  xp: number;
  description: string;
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  date: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  uuid: string;
  username: string;
  email: string;
  stats?: Types.ObjectId;
  avatar?: string;
  refreshToken?: string;
  titles: string[];
  roles: Array<'admin' | 'user' | 'mod'>;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IRequest<Type> extends Request {
  body: Type;
}
