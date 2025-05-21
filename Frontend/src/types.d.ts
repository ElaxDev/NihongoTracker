export interface IUser {
  _id: string;
  avatar?: string;
  banner?: string;
  username: string;
  clubs?: string[];
  discordId?: string;
  stats: IStats;
  titles: string[];
  roles: userRoles;
  createdAt?: Date;
  updatedAt?: Date;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

enum userRoles {
  admin = 'admin',
  user = 'user',
  mod = 'mod',
}

export type OutletProfileContextType = {
  user: IUser | undefined;
  username: string | undefined;
};

export type OutletMediaContextType = {
  mediaDocument: IMediaDocument | undefined;
  mediaType: string | undefined;
};

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

export type ILoginResponse = Pick<
  IUser,
  '_id' | 'username' | 'stats' | 'avatar' | 'titles' | 'roles' | 'discordId'
>;

export interface IRegisterInput {
  username: string;
  password: string;
  passwordConfirmation: string;
}

export interface ILoginInput {
  username: string;
  password: string;
}

export type logoutResponseType = {
  message: string;
};

enum sortTypes {
  asc = 'asc',
  desc = 'desc',
}

export type filterTypes =
  | 'userLevel'
  | 'userXp'
  | 'readingXp'
  | 'readingLevel'
  | 'listeningXp'
  | 'listeningLevel'
  | 'charCountVn'
  | 'charCountLn'
  | 'readingTimeVn'
  | 'charCountReading'
  | 'pageCountLn'
  | 'readingTimeLn'
  | 'pageCountManga'
  | 'charCountManga'
  | 'readingTimeManga'
  | 'mangaPages'
  | 'listeningTime'
  | 'readingTime'
  | 'animeEpisodes'
  | 'animeWatchingTime'
  | 'videoWatchingTime';

export interface IRankingParams {
  page?: number;
  limit?: number;
  sort?: sortTypes;
  filter?: filterTypes;
}

export interface ILogsParams extends Pick<IRankingParams, 'page' | 'limit'> {
  mediaId?: string;
  mediaType?: string;
}

export interface updateUserRequest {
  username?: string;
  password?: string;
  discordId?: string;
  avatar?: string;
  newPassword?: string;
  newPasswordConfirm?: string;
}

export interface IEditedFields {
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  xp?: number;
}

export interface updateLogRequest {
  description?: string;
  time?: number;
  date?: Date;
  contentId?: number;
  episodes?: number;
  pages?: number;
  chars?: number;
}

export interface IContentMedia {
  contentId: string;
  contentImage: string | null;
  coverImage: string | null;
  contentTitleNative: string;
  contentTitleRomaji?: string;
  contentTitleEnglish: string;
  description?: string;
  episodes?: number;
  episodeDuration?: number;
  chapters?: number;
  volumes?: number;
  synonyms?: string[] | null;
  isAdult: boolean;
  date?: Date | null;
}

export interface ICreateLog
  extends Omit<
    ILog,
    '_id' | 'user' | 'xp' | 'editedFields' | 'createdAt' | 'updatedAt'
  > {
  createMedia?: boolean;
  mediaData?: IContentMedia;
}

export interface ILog {
  _id: string;
  user: string;
  type: 'reading' | 'anime' | 'vn' | 'video' | 'manga' | 'audio' | 'other';
  mediaId?: string;
  xp: number;
  private: boolean;
  isAdult: boolean;
  description: string;
  editedFields?: IEditedFields | null;
  episodes?: number;
  pages?: number;
  chars?: number;
  time?: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRankingResponse {
  username: string;
  avatar: string;
  stats: Pick<IStats, filterTypes>;
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

export interface IVNDocument {
  _id: string;
  id: string;
  title: string;
  latin: string | null;
  alias: string[];
  image: string;
  score: number;
}

export interface IAnimeDocument {
  _id: string;
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

export interface IMediaTitle {
  contentTitleNative: string;
  contentTitleRomaji?: string;
  contentTitleEnglish?: string;
}

export interface IImmersionList {
  anime: IMediaDocument[];
  manga: IMediaDocument[];
  reading: IMediaDocument[];
  vn: IMediaDocument[];
  video: IMediaDocument[];
}

export interface IMediaDocument extends Document {
  contentId: string;
  title: IMediaTitle;
  contentImage?: string;
  coverImage?: string;
  description: string;
  type: 'anime' | 'manga' | 'reading' | 'vn' | 'video';
  episodes?: number;
  episodeDuration?: number;
  chapters?: number;
  volumes?: number;
  synonyms?: string[];
  isAdult: boolean;
}

export interface IAverageColor {
  rgb: string;
  rgba: string;
  hex: string;
  hexa: string;
  value: [number, number, number, number];
  isDark: boolean;
  isLight: boolean;
  error?: Error;
}

export interface ILogData {
  type: string | null;
  titleNative: string;
  titleRomaji: string | null;
  titleEnglish: string | null;
  description: string | null;
  mediaDescription: string;
  mediaName: string;
  mediaId: string;
  episodes: number;
  time: number;
  chars: number;
  pages: number;
  hours: number;
  minutes: number;
  showTime: boolean;
  showChars: boolean;
  img: string;
  cover: string;
  date: Date | null;
}
