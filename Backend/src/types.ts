import { Request } from 'express';
import { Types, Document } from 'mongoose';

export interface decodedJWT {
  id: Types.ObjectId;
  iat: number;
  exp: number;
}

export interface tokenDataType {
  id: Types.ObjectId;
}

export interface IRanking extends Document {
  _id: Types.ObjectId;
  month: number;
  year: number;
  users?: Types.ObjectId[];
}

export enum userRoles {
  admin = 'admin',
  user = 'user',
  mod = 'mod',
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  avatar?: string;
  username: string;
  password: string;
  clubs?: Types.ObjectId[];
  stats: IStats;
  titles: string[];
  roles: userRoles;
  createdAt?: Date;
  updatedAt?: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

export interface IStats {
  userLevel: number;
  userXp: number;
  readingXp: number;
  readingLevel: number;
  listeningXp: number;
  listeningLevel: number;
  charCountVn: number;
  charCountLn: number;
  readingTimeVn: number;
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
}

export interface IEditedFields {
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  xp?: number;
}

export interface ILog extends Document {
  _id: Types.ObjectId;
  user: Types.ObjectId;
  type: 'reading' | 'anime' | 'vn' | 'video' | 'ln' | 'manga';
  contentId?: string;
  xp: number;
  description: string;
  editedFields?: IEditedFields | null;
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  date?: Date;
}

export interface updateRequest {
  username?: string;
  password?: string;
  avatar?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
}

export interface IRegister {
  username: string;
  password: string;
  passwordConfirmation: string;
}

export interface ILogin {
  username: string;
  password: string;
}

export interface IRequest<Type> extends Request {
  body: Type;
}
