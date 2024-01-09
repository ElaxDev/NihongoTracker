import { Schema, model } from 'mongoose';
import { IStat } from '../types';

const statSchema = new Schema<IStat>({
  readingXp: { type: Number, default: 0 },
  readingLevel: { type: Number, default: 0 },
  listeningXp: { type: Number, default: 0 },
  listeningLevel: { type: Number, default: 0 },
  charCountVn: { type: Number, default: 0 },
  charCountLn: { type: Number, default: 0 },
  charCountReading: { type: Number, default: 0 },
  pageCountLn: { type: Number, default: 0 },
  readingTimeLn: { type: Number, default: 0 },
  pageCountManga: { type: Number, default: 0 },
  charCountManga: { type: Number, default: 0 },
  readingTimeManga: { type: Number, default: 0 },
  mangaPages: { type: Number, default: 0 },
  listeningTime: { type: Number, default: 0 },
  readingTime: { type: Number, default: 0 },
  animeEpisodes: { type: Number, default: 0 },
  animeWatchingTime: { type: Number, default: 0 },
  videoWatchingTime: { type: Number, default: 0 },
  lnCount: { type: Number, default: 0 },
  readManga: { type: [String], default: [] },
  watchedAnime: { type: [String], default: [] },
  playedVn: { type: [String], default: [] },
  knownWords: { type: [String], default: [] },
});

export default model<IStat>('Stat', statSchema);
