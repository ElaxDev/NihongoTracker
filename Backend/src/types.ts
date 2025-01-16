import { Request } from 'express';
import { Types, Document } from 'mongoose';

export interface IVisualNovelTitle extends Document {
  id: string;
  lang: string;
  official: boolean;
  title: string;
  latin: string;
}
export interface IVisualNovelDetail extends Document {
  id: string;
  olang: string;
  image: string;
  l_wikidata: string;
  c_votecount: number;
  c_rating: number;
  c_average: number;
  length: number;
  devstatus: number;
  alias: string;
  description: string;
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

export interface ILightNovelTitle {
  romaji: string;
  english: string;
  native: string;
}

export interface ILightNovelDocument extends Document {
  title: ILightNovelTitle;
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
  immersionList: Types.ObjectId;
  titles: string[];
  roles: userRoles[];
  lastImport?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

export interface IImmersionListItemMedia {
  contentTitleNative: string;
  contentTitleRomaji?: string;
  contentImage: string;
}

export interface IImmersionListItem {
  contentId: string;
  contentMedia: IImmersionListItemMedia;
}

export interface IImmersionList extends Document {
  _id: Types.ObjectId;
  manga: IImmersionListItem[];
  anime: IImmersionListItem[];
  vn: IImmersionListItem[];
  reading: IImmersionListItem[];
  video: IImmersionListItem[];
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
  contentId?: string;
  xp: number;
  private: boolean;
  adult: boolean;
  image?: string;
  description?: string;
  mediaName?: string;
  editedFields?: IEditedFields | null;
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  date: Date;
}

export interface ICreateLog extends ILog {
  anilistId?: string;
  createMedia?: boolean;
  contentMedia?: IImmersionListItemMedia;
  mediaData?: IMangaDocument | ILightNovelDocument | IAnimeDocument;
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
