import { Request } from 'express';
import { Types, Document } from 'mongoose';

export interface IVisualNovelDocument extends Document {
  title: string;
  publisher: string;
  description?: string;
  vndbScore?: number;
  vndbId: number;
  approximatedCharCount?: number;
  approximatedReadingTime?: number;
  coverImage: string;
  coverImageNSFW?: boolean;
  startedUserCount?: number;
  readingUserCount?: number;
  finishedUserCount?: number;
  adult: boolean;
}

export interface IMangaDocument extends Document {
  title: string;
  anilistId: number;
  description: string;
  genres: string[];
  chapters: number;
  volumes: number;
  anilistScore?: number;
  adult: boolean;
  status: string;
  approximatedCharCount?: number;
  approximatedReadingTime?: number;
  coverImage: string;
  startDate: string;
  endDate: string;
}

export interface ILightNovelDocument extends Document {
  title: string;
  anilistId: number;
  description?: string;
  author?: string;
  genres?: string[];
  anilistScore?: number;
  startDate?: string;
  endDate?: string;
  adult: boolean;
  coverImage: string;
  approximatedCharCount?: number;
  approximatedReadingTime?: number;
  startedUserCount?: number;
  readingUserCount?: number;
  finishedUserCount?: number;
}

export interface IAnimeDocument extends Document {
  sources?: string[];
  title: string;
  type: 'TV' | 'MOVIE' | 'OVA' | 'ONA' | 'SPECIAL' | 'UNKNOWN';
  episodes?: number;
  status: 'FINISHED' | 'ONGOING' | 'UPCOMING' | 'UNKNOWN';
  animeSeason: {
    season?: 'SPRING' | 'SUMMER' | 'FALL' | 'WINTER' | 'UNDEFINED';
    year: number | null;
  };
  picture?: string;
  thumbnail?: string;
  duration?: {
    value?: number;
    unit?: 'SECONDS';
  } | null;
  synonyms?: string[];
  relatedAnime?: string[];
  tags?: string[];
}

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
  banner?: string;
  username: string;
  password: string;
  discordId?: string;
  clubs?: Types.ObjectId[];
  stats: IStats;
  titles: string[];
  roles: userRoles[];
  lastImport?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

export interface IStats {
  userLevel: number;
  userXp: number;
  userXpToNextLevel: number;
  userXpToCurrentLevel: number;
  readingXp: number;
  readingLevel: number;
  readingXpToNextLevel: number;
  readingXpToCurrentLevel: number;
  listeningXp: number;
  listeningLevel: number;
  listeningXpToNextLevel: number;
  listeningXpToCurrentLevel: number;
  charCountVn: number;
  charCountLn: number;
  readingTimeVn: number;
  charCountReading: number;
  pageCountLn: number;
  readingTimeLn: number;
  pageCountManga: number;
  pageCountReading: number;
  charCountManga: number;
  readingTimeManga: number;
  mangaPages: number;
  listeningTime: number;
  audioListeningTime: number;
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
  user: Types.ObjectId;
  type: 'reading' | 'anime' | 'vn' | 'video' | 'manga' | 'audio' | 'other';
  contentId?: Types.ObjectId | string;
  xp: number;
  private: boolean;
  adult: boolean;
  image?: string;
  description: string;
  editedFields?: IEditedFields | null;
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  date: Date;
}

export interface ICreateAnimeLog extends ILog {
  anilistUrl?: string;
}
export interface updateRequest {
  username?: string;
  password?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
  discordId?: string;
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
