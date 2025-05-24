import { Request } from 'express';
import { Document, Types } from 'mongoose';

export interface decodedJWT {
  id: Types.ObjectId;
  iat: number;
  exp: number;
}

// export interface tokenDataType {
//   id: Types.ObjectId;
// }

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

export interface IMediaTitle {
  contentTitleNative: string;
  contentTitleRomaji?: string;
  contentTitleEnglish?: string;
}

export interface IMediaDocument extends Document {
  contentId: string;
  title: IMediaTitle;
  contentImage?: string;
  coverImage?: string;
  description?: string;
  type: 'anime' | 'manga' | 'reading' | 'vn' | 'video';
  episodes?: number;
  episodeDuration?: number;
  chapters?: number;
  volumes?: number;
  synonyms?: string[] | null;
  isAdult: boolean;
}

export interface IImportLogs {
  forced: boolean;
  logs: ILog[];
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
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: Date | null;
}

export interface SearchAnilistArgs {
  search?: string | null;
  ids?: number[] | null;
  type?: 'ANIME' | 'MANGA' | null;
  format?:
    | 'TV'
    | 'TV_SHORT'
    | 'MOVIE'
    | 'SPECIAL'
    | 'OVA'
    | 'ONA'
    | 'MUSIC'
    | 'MANGA'
    | 'NOVEL'
    | 'ONE_SHOT'
    | null;
}

export interface IEditedFields {
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  xp?: number;
}

export interface AnilistSearchResult {
  Page: {
    pageInfo: {
      total: number;
      currentPage: number;
      lastPage: number;
      hasNextPage: boolean;
      perPage: number;
    };
    media: {
      id: number;
      title: {
        romaji: string;
        english: string;
        native: string;
      };
      format: 'NOVEL' | 'MANGA' | 'ONE_SHOT';
      type: 'ANIME' | 'MANGA';
      coverImage: {
        extraLarge: string;
        medium: string;
        large: string;
        color: string;
      };
      synonyms: string[];
      episodes?: number;
      duration?: number;
      chapters?: number;
      volumes?: number;
      isAdult: boolean;
      bannerImage: string;
      siteUrl: string;
      description: string;
    }[];
  };
}

export interface ILog extends Document {
  user: Types.ObjectId;
  type: 'reading' | 'anime' | 'vn' | 'video' | 'manga' | 'audio' | 'other';
  mediaId?: string;
  xp: number;
  private: boolean;
  isAdult: boolean;
  description?: string;
  editedFields?: IEditedFields | null;
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  date: Date | null;
}

export interface IContentMedia {
  contentId: string;
  contentImage?: string;
  coverImage?: string;
  contentTitleNative: string;
  contentTitleRomaji?: string;
  contentTitleEnglish: string;
  description?: string;
  type: 'anime' | 'manga' | 'reading' | 'vn' | 'video';
  episodes?: number;
  episodeDuration?: number;
  chapters?: number;
  volumes?: number;
  synonyms?: string[] | null;
  isAdult: boolean;
  date?: Date | null;
}

export interface ICreateLog extends ILog {
  createMedia?: boolean;
  mediaData?: IContentMedia;
}

export interface IUpdateRequest {
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

export interface csvLogs {
  type: 'anime' | 'manga' | 'reading' | 'vn' | 'video' | 'audio' | 'other';
  description: string;
  date: string;
  time: string;
  chars?: string;
  pages?: string;
  episodes?: string;
  mediaId?: string;
}
